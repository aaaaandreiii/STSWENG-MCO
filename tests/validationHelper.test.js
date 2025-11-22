const {
  sanitizeString,
  isValidUsername,
  isValidName,
  isValidPhone,
} = require("../helpers/validation.js");

describe("validation helpers", () => {
  describe("sanitizeString", () => {
    it("returns empty string for non-string input", () => {
      expect(sanitizeString(null)).toBe("");
      expect(sanitizeString(123)).toBe("");
    });

    it("trims and collapses internal whitespace", () => {
      expect(sanitizeString("  hello   world  ")).toBe("hello world");
    });
  });

  describe("isValidUsername", () => {
    it("returns false for non-string", () => {
      expect(isValidUsername(null)).toBe(false);
    });

    it("returns false for too short or too long usernames", () => {
      expect(isValidUsername("ab")).toBe(false); // too short
      expect(isValidUsername("a".repeat(40))).toBe(false); // too long
    });

    it("returns false for invalid characters", () => {
      expect(isValidUsername("bad username")).toBe(false); // space
      expect(isValidUsername("bad!name")).toBe(false); // invalid symbol
    });

    it("returns true for a valid username", () => {
      expect(isValidUsername("valid_user-123")).toBe(true);
    });
  });

  describe("isValidName", () => {
    it("returns false for non-string", () => {
      expect(isValidName(null)).toBe(false);
    });

    it("validates minimum and maximum length", () => {
      expect(isValidName("")).toBe(false); // too short
      const longName = "a".repeat(101); // > 100
      expect(isValidName(longName)).toBe(false);
    });

    it("returns false for invalid characters", () => {
      expect(isValidName("John123")).toBe(false);
      expect(isValidName("John@Doe")).toBe(false);
    });

    it("returns true for a valid name", () => {
      expect(isValidName("John O'Connor")).toBe(true);
    });
  });

  describe("isValidPhone", () => {
    it("returns false for non-string", () => {
      expect(isValidPhone(undefined)).toBe(false);
    });

    it("returns false for too short or too long phone numbers", () => {
      expect(isValidPhone("123456")).toBe(false); // < 7
      expect(isValidPhone("1".repeat(25))).toBe(false); // > 20
    });

    it("returns false for invalid characters", () => {
      expect(isValidPhone("12345abc")).toBe(false);
    });

    it("returns true for a valid phone number", () => {
      expect(isValidPhone("+63 (912) 345-6789")).toBe(true);
      expect(isValidPhone("09123456789")).toBe(true);
    });
  });
});
