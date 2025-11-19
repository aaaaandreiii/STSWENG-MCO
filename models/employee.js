const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSchema = new Schema({
  username: String,
  password: String,

  hasAccess: {
    type: Boolean,
    default: true
  },

  role: {
    type: String,
    enum: ['admin', 'manager', 'frontdesk'],
    default: 'frontdesk',                     //principle of least privilege
    required: true
  },

  name: String,
  contactNum: String,
  emergencyContactName: String,
  emergencyContactNum: String,
  dateRegistered: Date,
});

module.exports = mongoose.model("employee", employeeSchema);
