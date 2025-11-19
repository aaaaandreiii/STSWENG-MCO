var mongoose = require("mongoose");

var DiscountSchema = new mongoose.Schema({
  description: {
    type: String,
  },
  rate: {
    type: Number,
  },
  minimumPax: {
    type: Number,
  },
});

module.exports = mongoose.model("discount", DiscountSchema);
