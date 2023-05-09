'use strict';

var CreditCard = require('~/cartridge/scripts/subpro/models/paymentMethods/creditCard');

// If you need to add a new payment method, please add the model of its to this object.
module.exports = {
    CREDIT_CARD: new CreditCard()
};
