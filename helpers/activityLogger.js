const Activity = require("../models/activity.js");

module.exports = function activityLogger(employee, description) {
  Activity.create({ username: employee, activityName: description });
};
