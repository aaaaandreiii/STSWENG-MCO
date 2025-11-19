var mongoose = require("mongoose");

var TransactionSchema = new mongoose.Schema({
  chargesList: {
    type: [
      {
        reason: {
          type: String,
          trim: true,
        },

        amount: {
          type: Number,
        },
      },
    ],
  },

  discountsList: {
    type: [
      {
        reason: {
          type: String,
          trim: true,
        },

        amount: {
          type: Number,
        },
      },
    ],
  },

  totalCost: {
    type: Number,
    required: true,
  },

  customerPayment: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Transaction", TransactionSchema);
