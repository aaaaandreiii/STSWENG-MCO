var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['booked', 'reserved', 'finished', 'cancelled'],
    },

    clientName: {type: String},
    clientMobileNumber: {type: String},

    repName: {type: String},
    repMobileNumber: {type: String},

    eventType: {type: String},
    eventDate: {type: Date},
    eventTime: {type: String},

    numOfPax: {type: Number},

    eventNotes: {type: String},
    eventVenues: {type: [String]},
    eventPackages: {type: [mongoose.ObjectId]},
    
    packageAdditionalPax: {type: Boolean},

    menuPackage: {
        type: {
            saladName: {type: String},
            saladQuantity: {type: Number},
            pastaName: {type: String},
            pastaQuantity: {type: Number},
            beefName: {type: String},
            beefQuantity: {type: Number},
            porkName: {type: String},
            porkQuantity: {type: Number},
            chickenName: {type: String},
            chickenQuantity: {type: Number},
            fishName: {type: String},
            fishQuantity: {type: Number},
            icedTeaQuantity: {type: Number},
            riceQuantity: {type: Number},
        },
    },

    menuAdditional: {
        type: [
            {
                foodItem: {type: mongoose.ObjectId},
                foodQuantity: {type: Number},
                foodCost: {type: Number}
            },
        ],
    },

    transactionCharges: {
        type: [
            {
                chargeName: {type: String},
                chargeQuantity: {type: Number},
                chargePrice: {type: Number},
            },
        ],
    },

    transactionDiscounts: {
        type: [
            {
                discountName: {type: String},
                discountPrice: {type: Number},
            },
        ],
    },

    totalPrices: {
        type:{
            packages: {type: Number},
            food: {type: Number},
            charges: {type: Number},
            discounts: {type: Number},
            all: {type: Number}
        }
    },

    downpaymentDate: {type: Date},
    downpaymentMode: {type: String},
    downpaymentAmount: {type: Number},

    finalPaymentDate: {type: Date},
    finalPaymentMode: {type: String},
    finalPaymentAmount: {type: Number},

    cancelReason: {type: String},
});

module.exports = mongoose.model('Event', EventSchema);