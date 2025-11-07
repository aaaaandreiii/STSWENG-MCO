const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
    username: String,
    password: String,
    hasAccess: Boolean,
    role: {
        type: String,
        enum: ['admin', 'employee'],
    },
    
    name: String,
    contactNum: String,
    emergencyContactName: String,
    emergencyContactNum: String,
    dateRegistered: Date
});

module.exports = mongoose.model('employee', employeeSchema);