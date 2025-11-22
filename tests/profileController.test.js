// tests/profileController.test.js
const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const validation = require("../helpers/validation.js");
const passwordValidator = require("../helpers/newPasswordValidator.js");
const activityLogger = require("../helpers/activityLogger.js");
const profileController = require("../controllers/profile-controller.js");

jest.mock("../models/employee.js");
jest.mock("bcrypt");
jest.mock("../helpers/activityLogger.js");

// Mock validation helpers with a factory so we can tweak behaviors per test
jest.mock("../helpers/validation.js", () => ({
  sanitizeString: jest.fn((s) => s),
  isValidName: jest.fn(() => true),
  isValidPhone: jest.fn(() => true),
}));

jest.mock("../helpers/newPasswordValidator.js", () => ({
  isValidPassword: jest.fn(),
}));

const { sanitizeString, isValidName, isValidPhone } = validation;
const { isValidPassword } = passwordValidator;

describe("Profile Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {
        user: {
          username: "jdoe",
          role: "employee",
        },
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
      redirect: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();

    // default validation behavior
    sanitizeString.mockImplementation((s) => s);
    isValidName.mockReturnValue(true);
    isValidPhone.mockReturnValue(true);
    isValidPassword.mockResolvedValue(true);
  });

  // --------------------------
  // getProfile
  // --------------------------
  describe("getProfile", () => {
    it("redirects to /login when no user session", async () => {
      req.session = null;

      await profileController.getProfile(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith("/login");
      expect(Employee.findOne).not.toHaveBeenCalled();
    });

    it("renders profile when employee is found", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
      };
      Employee.findOne.mockResolvedValue(employee);

      await profileController.getProfile(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "jdoe" });
      expect(res.render).toHaveBeenCalledWith("profile", {
        employee: {
          username: "jdoe",
          name: "John Doe",
          role: "employee",
          contactNum: "09123456789",
          emergencyContactName: "Jane Doe",
          emergencyContactNum: "09987654321",
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 404 when employee is not found", async () => {
      Employee.findOne.mockResolvedValue(null);

      await profileController.getProfile(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "jdoe" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith("error", {
        message: "Profile not found",
      });
    });
  });

  // --------------------------
  // updateProfile
  // --------------------------
  describe("updateProfile", () => {
    it("redirects to /login when no user session", async () => {
      req.session = null;

      await profileController.updateProfile(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith("/login");
      expect(Employee.findOne).not.toHaveBeenCalled();
    });

    it("returns 404 when employee is not found", async () => {
      Employee.findOne.mockResolvedValue(null);

      await profileController.updateProfile(req, res, next);

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "jdoe" });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.render).toHaveBeenCalledWith("error", {
        message: "Could not update profile",
      });
    });

    it("updates profile info without password change", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      req.body = {
        name: "New Name",
        contactNum: "09111111111",
        emergencyContactName: "New EC",
        emergencyContactNum: "09999999999",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };

      await profileController.updateProfile(req, res, next);

      expect(isValidName).toHaveBeenCalledWith("New Name");
      expect(isValidPhone).toHaveBeenCalledWith("09111111111");
      expect(isValidPhone).toHaveBeenCalledWith("09999999999");

      expect(Employee.updateOne).toHaveBeenCalledWith(
        { username: "jdoe" },
        expect.objectContaining({
          name: "New Name",
          contactNum: "09111111111",
          emergencyContactName: "New EC",
          emergencyContactNum: "09999999999",
        }),
      );

      expect(activityLogger).toHaveBeenCalledWith(
        "jdoe",
        "Updated own profile",
      );
      expect(res.redirect).toHaveBeenCalledWith("/profile");
    });

    it("returns 400 when name is invalid", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      isValidName.mockReturnValueOnce(false);

      req.body = {
        name: "!!! invalid name !!!",
      };

      await profileController.updateProfile(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("profile", {
        employee: {
          username: "jdoe",
          name: "John Doe",
          role: "employee",
          contactNum: "09123456789",
          emergencyContactName: "Jane Doe",
          emergencyContactNum: "09987654321",
        },
        error: "Could not update profile",
      });
      expect(Employee.updateOne).not.toHaveBeenCalled();
      expect(activityLogger).not.toHaveBeenCalled();
    });

    it("updates profile with password change when valid", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      req.body = {
        name: "New Name",
        contactNum: "09111111111",
        emergencyContactName: "New EC",
        emergencyContactNum: "09999999999",
        oldPassword: "oldPassword123",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      };

      bcrypt.compare.mockResolvedValue(true);
      isValidPassword.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("newHashedPassword");

      await profileController.updateProfile(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith("oldPassword123", "oldHash");
      expect(isValidPassword).toHaveBeenCalledWith("NewPassword123", "jdoe");
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123", 10);

      expect(Employee.updateOne).toHaveBeenCalledWith(
        { username: "jdoe" },
        expect.objectContaining({
          name: "New Name",
          contactNum: "09111111111",
          emergencyContactName: "New EC",
          emergencyContactNum: "09999999999",
          password: "newHashedPassword",
        }),
      );

      expect(activityLogger).toHaveBeenCalledWith(
        "jdoe",
        "Updated own profile (with password change)",
      );
      expect(res.redirect).toHaveBeenCalledWith("/profile");
    });

    it("returns 400 when password fields are missing but change is requested", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      // wantsPasswordChange true because oldPassword is non-empty
      req.body = {
        oldPassword: "oldPassword123",
        newPassword: "",
        confirmPassword: "",
      };

      await profileController.updateProfile(req, res, next);

      expect(activityLogger).toHaveBeenCalledWith(
        "jdoe",
        "Failed profile update (missing password fields)",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("profile", {
        employee: {
          username: "jdoe",
          name: "John Doe",
          role: "employee",
          contactNum: "09123456789",
          emergencyContactName: "Jane Doe",
          emergencyContactNum: "09987654321",
        },
        error: "Could not update profile",
      });
      expect(Employee.updateOne).not.toHaveBeenCalled();
    });

    it("returns 400 when new password and confirm password do not match", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      req.body = {
        oldPassword: "oldPassword123",
        newPassword: "NewPass1",
        confirmPassword: "DifferentPass",
      };

      await profileController.updateProfile(req, res, next);

      expect(activityLogger).toHaveBeenCalledWith(
        "jdoe",
        "Failed profile update (password mismatch)",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("profile", {
        employee: {
          username: "jdoe",
          name: "John Doe",
          role: "employee",
          contactNum: "09123456789",
          emergencyContactName: "Jane Doe",
          emergencyContactNum: "09987654321",
        },
        error: "Could not update profile",
      });
      expect(Employee.updateOne).not.toHaveBeenCalled();
    });

    it("returns 400 when old password is incorrect", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      req.body = {
        oldPassword: "wrongOldPassword",
        newPassword: "NewPassword123",
        confirmPassword: "NewPassword123",
      };

      bcrypt.compare.mockResolvedValue(false); // wrong old password

      await profileController.updateProfile(req, res, next);

      expect(activityLogger).toHaveBeenCalledWith(
        "jdoe",
        "Failed profile update (wrong old password)",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("profile", {
        employee: {
          username: "jdoe",
          name: "John Doe",
          role: "employee",
          contactNum: "09123456789",
          emergencyContactName: "Jane Doe",
          emergencyContactNum: "09987654321",
        },
        error: "Could not update profile",
      });
      expect(Employee.updateOne).not.toHaveBeenCalled();
    });

    it("returns 400 when new password is invalid according to validator", async () => {
      const employee = {
        username: "jdoe",
        name: "John Doe",
        role: "employee",
        contactNum: "09123456789",
        emergencyContactName: "Jane Doe",
        emergencyContactNum: "09987654321",
        password: "oldHash",
      };
      Employee.findOne.mockResolvedValue(employee);

      req.body = {
        oldPassword: "oldPassword123",
        newPassword: "weak",
        confirmPassword: "weak",
      };

      bcrypt.compare.mockResolvedValue(true); // old password OK
      isValidPassword.mockResolvedValue(false); // new password invalid

      await profileController.updateProfile(req, res, next);

      expect(isValidPassword).toHaveBeenCalledWith("weak", "jdoe");
      expect(activityLogger).toHaveBeenCalledWith(
        "jdoe",
        "Failed profile update (weak or reused password)",
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith("profile", {
        employee: {
          username: "jdoe",
          name: "John Doe",
          role: "employee",
          contactNum: "09123456789",
          emergencyContactName: "Jane Doe",
          emergencyContactNum: "09987654321",
        },
        error: "Could not update profile",
      });
      expect(Employee.updateOne).not.toHaveBeenCalled();
    });
  });
});
