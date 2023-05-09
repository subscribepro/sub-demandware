'use strict';

var Status = require('dw/system/Status');
var OrderMgr = require('dw/order/OrderMgr');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * authorizePayment
 * @param {dw.order.Order} order - the modified order.
 * @param {Object} PaymentMethodModel - Payment Method Model with authorization logic.
 * @param {dw.order.OrderPaymentInstrument} paymentDetails - Order Payment Instrument
 * @returns {dw.system.Status} status (Status.OK or status.ERROR).
 */
function authorizePayment(order, PaymentMethodModel, paymentDetails) {
    var paymentAuthResult = PaymentMethodModel.authorize(order, paymentDetails);

    // If you need, you can add your own additional steps here.
    // if (paymentAuthResult.error) {
    //     COHelpers.cancelAllPaidTransactions(order);
    // }

    return paymentAuthResult;
}

/**
 * Perform custom payment authorization.
 * @param {dw.order.Order} order - API order object
 * @param {dw.order.OrderPaymentInstrument} paymentDetails - OrderPaymentInstrument
 * @returns {dw.system.Status} authorization status (Status.OK or status.ERROR)
 */
function performPaymentAuthorize(order, paymentDetails) {
    var paymentMethodsFactory = require('~/cartridge/scripts/subpro/factories/paymentMethodsFactory');
    var ocapiHelper = require('~/cartridge/scripts/subpro/helpers/ocapiHelper');

    var paymentMethod = paymentDetails.getPaymentMethod();
    var PaymentMethodModel = paymentMethodsFactory[paymentMethod];

    if (empty(PaymentMethodModel)) {
        var orderFailStatus = OrderMgr.failOrder(order, false);
        var errObj = ocapiHelper.errorResponse({
            status: 'UNSUPPORTED_PAYMENT_TYPE',
            message: 'Unexpected payment type'
        });
        errObj.orderFailStatus = orderFailStatus;

        return new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
    }

    var paymentAuthResult = new Status(Status.OK);

    paymentAuthResult = authorizePayment(order, PaymentMethodModel, paymentDetails);

    COHelpers.updateOrderPaymentStatus(order);

    return paymentAuthResult;
}

/**
 * Custom payment authorization.
 * @param {dw.order.Order} order - API order object
 * @param {dw.order.OrderPaymentInstrument} paymentDetails - OrderPaymentInstrument
 * @returns {dw.system.Status} authorization status (Status.OK or status.ERROR)
 */
var authorize = function (order, paymentDetails) {
    return performPaymentAuthorize(order, paymentDetails);
};

/**
 * Custom payment authorization of a credit card.
 * @param {dw.order.Order} order - the order
 * @param {dw.order.OrderPaymentInstrument} paymentDetails - specified payment details
 * @param {string} cvn - the credit card verification number
 * @returns {dw.system.Status} authorization status (Status.OK or status.ERROR)
 */
function authorizeCreditCard(order, paymentDetails, cvn) {
    //eslint-disable-line
    return performPaymentAuthorize(order, paymentDetails);
}

module.exports = {
    authorize: authorize,
    authorizeCreditCard: authorizeCreditCard
};
