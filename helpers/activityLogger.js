const Activity = require("../models/activity.js");

//purpose:
// login success/failure,
// logout,
// access denials,
// user creation/updates,
// event CRUD

async function logActivity(username, description, meta = {}) {
  try {
    await Activity.create({
      username,
      activityName: description,
      meta,
    });
  } catch (err) {
    console.error("Activity logging failed:", err.message);
  }
}

module.exports = logActivity;
