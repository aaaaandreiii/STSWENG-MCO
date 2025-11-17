var mongoose = require('mongoose');

var ChargeSchema = new mongoose.Schema({
    name: {
        type: String,
    },

    price: {
        type: Number,
    },
});

module.exports = mongoose.model('Charge', ChargeSchema);