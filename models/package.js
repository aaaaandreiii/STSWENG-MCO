var mongoose = require("mongoose");

var PackageSchema = new mongoose.Schema({
  packageCode: {
    type: String,
  },

  packageName: {
    type: String,
  },

  packagePrice: {
    type: Number,
  },

  packageVenue: {
    type: String,
  },

  variantCount: {
    type: Number,
  },

  foodQuantities: {
    type: [Number],
  },
});

module.exports = mongoose.model("Package", PackageSchema);
