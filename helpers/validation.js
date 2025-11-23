// TODO:
// sanitizeString(str) to trims, strips dangerous characters.
// isValidUsername(username) for length + allowed chars.
// isValidPhone(contactNum) for regex for digits, length limit.
// isValidName(name) for letters / spaces, length.
// maybe isValidDate, sanitizeNumber, etc

function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/\s+/g, " ");
}

function isValidUsername(username) {
  if (typeof username !== "string") return false;
  const u = username.trim();
  if (u.length < 3 || u.length > 32) return false;
  return /^[A-Za-z0-9_.-]+$/.test(u);
}

function isValidName(name) {
  if (typeof name !== "string") return false;
  const n = name.trim();
  if (n.length < 1 || n.length > 100) return false;
  return /^[A-Za-z ,.'-]+$/.test(n);
}

function isValidPhone(phone) {
  if (typeof phone !== "string") return false;
  const p = phone.trim();
  if (p.length < 7 || p.length > 20) return false;
  // allow digits, +, spaces, -, ()
  return /^[0-9+()\-\s]+$/.test(p);
}

module.exports = {
  sanitizeString,
  isValidUsername,
  isValidName,
  isValidPhone,
};
