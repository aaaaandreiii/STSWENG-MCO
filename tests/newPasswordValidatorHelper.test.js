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
      expect(result.message).toBe("Password must be at least 8 characters long");
    });

    it("returns failure when password matches old password", async () => {
      const password = "password123";
      const username = "admin";
      Employee.findOne.mockResolvedValue({ password: "hashedpw" });
      bcrypt.compare.mockResolvedValue(true); //same as old password

      const result = await isValidPassword(password, username);

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "New password must differ from the old password",
      );
    });

    it("returns success when password meets all requirements", async () => {
      const password = "newpassword123";
      const username = "admin";
      Employee.findOne.mockResolvedValue({ password: "hashedpw" });
      bcrypt.compare.mockResolvedValue(false); //different password

      const result = await isValidPassword(password, username);

      expect(result).toEqual({
        success: true,
        message: "Password is valid",
      });
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
  });
});
