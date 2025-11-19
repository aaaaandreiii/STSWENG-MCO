const bcrypt = require("bcrypt");
const Employee = require("../models/employee.js");

// async function isValidPassword(password, username) {
//   if (password < 8) return false;

//   const result = await comparePassword(username, password);
//   return !result;
// }

async function isValidPassword(password) {
  if (typeof password !== 'string') return false;
  const trimmed = password.trim();
  if (trimmed.length < 8) return false;
  return true;
}

async function comparePassword(username, password) {
  const employee = await Employee.findOne({ username });
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
