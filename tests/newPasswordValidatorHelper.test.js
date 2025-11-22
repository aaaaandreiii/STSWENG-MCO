const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");
const {
  isValidPassword,
  isOldPasswordSameAsPassword,
} = require("../helpers/newPasswordValidator.js");

jest.mock("../models/employee.js");
jest.mock("bcrypt");

describe("newPasswordValidator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValidPassword", () => {
    it("returns failure when password is less than 8 characters", async () => {
      const password = "short";
      const username = "admin";

      const result = await isValidPassword(password, username);

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Password must be at least 8 characters long",
      );
    });

    it("returns failure when password matches old password", async () => {
      const username = "user1";
      const password = "OldPassword1!"; // has uppercase, digits, etc.

      Employee.findOne.mockResolvedValue({ username, password: "hashed" });
      bcrypt.compare.mockResolvedValue(true); // new password == old password

      const result = await isValidPassword(password, username);

      expect(result.success).toBe(false);
      expect(result.message).toBe("New password must differ from the old password");
    });

    it("returns success when password meets all requirements", async () => {
      const username = "user1";
      const password = "ValidPassword1!"; // includes uppercase

      Employee.findOne.mockResolvedValue({ username, password: "hashed" });
      bcrypt.compare.mockResolvedValue(false); // new password != old password

      const result = await isValidPassword(password, username);

      expect(result).toEqual({
        success: true,
        message: "Password is valid",
      });
    });

    it("returns failure when password is not a string", async () => {
      const result = await isValidPassword(null, "admin");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Password is required");
    });

    it("fails when missing uppercase character", async () => {
      const password = "validpassword1!"; // no uppercase
      const result = await isValidPassword(password, null); // no username => no DB call

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Password must include at least one uppercase letter",
      );
    });

    it("fails when missing lowercase character", async () => {
      const password = "VALIDPASSWORD1!"; // no lowercase
      const result = await isValidPassword(password, null);

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Password must include at least one lowercase letter",
      );
    });

    it("fails when missing number", async () => {
      const password = "ValidPassword!"; // no number
      const result = await isValidPassword(password, null);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Password must include at least one number");
    });

    it("fails when missing special character", async () => {
      const password = "ValidPassword1"; // no special char
      const result = await isValidPassword(password, null);

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Password must include at least one special character",
      );
    });

    it("can succeed even when username is not provided", async () => {
      const password = "ValidPassword1!";
      // no username => should skip old-password check
      const result = await isValidPassword(password);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Password is valid");
    });
  });

  describe("isOldPasswordSameAsPassword", () => {
    it("returns true if password is same as old password", async () => {
      const password = "password123";
      const username = "admin";
      Employee.findOne.mockResolvedValue({ password: "hashedpw" });
      bcrypt.compare.mockResolvedValue(true);

      const result = await isOldPasswordSameAsPassword(password, username);

      expect(result).toBe(true);
    });
    it("returns false when employee record does not exist", async () => {
      Employee.findOne.mockResolvedValue(null);

      const result = await isOldPasswordSameAsPassword("Whatever1!", "ghost");

      expect(Employee.findOne).toHaveBeenCalledWith({ username: "ghost" });
      expect(result).toBe(false);
    });
  });
});
