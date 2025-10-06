var mongoose = require('mongoose');

var ActivitySchema = new mongoose.Schema({
    username: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: new Date(),
    },
    activityName: {
        type: String,
    },
});

module.exports = mongoose.model('activity', ActivitySchema);