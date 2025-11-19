var mongoose = require("mongoose");

var FoodSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  price: {
    type: Number,
  },
});

module.exports = mongoose.model("Food", FoodSchema);
