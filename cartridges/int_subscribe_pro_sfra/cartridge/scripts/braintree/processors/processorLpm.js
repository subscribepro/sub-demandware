'use strict';

var originalExports = Object.keys(module.superModule || {});

originalExports.forEach(function (originalExport) {
    module.exports[originalExport] = module.superModule[originalExport];
});

var base = module.exports;

/**
 * Perform API call to create new(sale) transaction
 * @param {dw.order.Order} order Current order
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument Used payment instrument
 * @return {Object} Response data from API call
 */
function createSaleTransactionData(order, paymentInstrument) {
    if (empty(paymentInstrument.custom.braintreePaymentMethodNonce) && empty(paymentInstrument.creditCardToken)) {
        throw new Error('paymentInstrument.custom.braintreePaymentMethodNonce or paymentInstrument.creditCardToken are empty');
    }
    var prefs = require('*/cartridge/config/braintreePreferences');
    var data = base.createBaseSaleTransactionData(order, paymentInstrument, prefs);
    data.options.submitForSettlement = true;
    data.deviceData = paymentInstrument.custom.braintreeFraudRiskData;

    data.channel = 'SubscribePro_BT';
    return data;
}

base.createSaleTransactionData = createSaleTransactionData;

module.exports = base;
