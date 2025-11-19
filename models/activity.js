var mongoose = require("mongoose");

var ActivitySchema = new mongoose.Schema({
  username: {
    type: String,
  },

  timestamp: {
    type: Date,
    default: Date.now,
    // default: new Date(),
  },

  activityName: {
    type: String,
  },

  meta: {
    type: Object,
    default: {},
  },
});

module.exports = mongoose.model("activity", ActivitySchema);
