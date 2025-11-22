const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");

async function isValidPassword(password, username) {
  const failure = (message) => ({ success: false, message });

  if (typeof password !== "string") {
    return failure("Password is required");
  }

  const trimmed = password.trim();
  if (trimmed.length < 8) {
    return failure("Password must be at least 8 characters long");
  }

  const requirements = [
    [/[A-Z]/, "Password must include at least one uppercase letter"],
    [/[a-z]/, "Password must include at least one lowercase letter"],
    [/[0-9]/, "Password must include at least one number"],
    [
      /[^A-Za-z0-9]/,
      "Password must include at least one special character",
    ],
  ];

  for (const [regex, message] of requirements) {
    if (!regex.test(trimmed)) {
      return failure(message);
    }
  }

  // check if new password not equal to old password
  if (username) {
    const sameAsOld = await isOldPasswordSameAsPassword(trimmed, username);
    if (sameAsOld) {
      return failure("New password must differ from the old password");
    }
  }

  return { success: true, message: "Password is valid" };
}

async function comparePassword(username, password) {
  const employee = await Employee.findOne({ username });
  if (!employee || !employee.password) return false;

  const hash = employee.password;
  const result = await bcrypt.compare(password, hash);
  return result;
}

async function isOldPasswordSameAsPassword(password, username) {
  return await comparePassword(username, password);
}

module.exports = {
  isValidPassword,
  isOldPasswordSameAsPassword,
};
