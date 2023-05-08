'use strict';

const Status = require('dw/system/Status');
const OrderMgr = require('dw/order/OrderMgr');
const COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * authorizePayment
 * @param {dw.order.Order} order - the modified order.
 * @param {Object} PaymentMethodModel - Payment Method Model with authorization logic.
 * @param {dw.order.OrderPaymentInstrument} paymentDetails - Order Payment Instrument
 * @returns {dw.system.Status} status (Status.OK or status.ERROR).
 */
function authorizePayment(order, PaymentMethodModel, paymentDetails) {
    const paymentAuthResult = PaymentMethodModel.authorize(order, paymentDetails);

    if (paymentAuthResult.error) {
        COHelpers.cancelAllPaidTransactions(order);
    }

    return paymentAuthResult;
}

/**
 * Perform custom payment authorization.
 * @param {dw.order.Order} order - API order object
 * @param {dw.order.OrderPaymentInstrument} paymentDetails - OrderPaymentInstrument
 * @returns {dw.system.Status} authorization status (Status.OK or status.ERROR)
 */
function performPaymentAuthorize(order, paymentDetails) {
    const paymentMethodsFactory = require('~/cartridge/scripts/subpro/factories/paymentMethodsFactory');
    const ocapiHelper = require('~/cartridge/scripts/subpro/helpers/ocapiHelper');

    const paymentMethod = paymentDetails.getPaymentMethod();
    const PaymentMethodModel = paymentMethodsFactory[paymentMethod];

    if (empty(PaymentMethodModel)) {
        let orderFailStatus = OrderMgr.failOrder(order, !order.custom.subproSubscriptionsToBeProcessed);
        let errObj = ocapiHelper.errorResponse({
            status: 'UNSUPPORTED_PAYMENT_TYPE',
            message: 'Unexpected payment type'
        });
        errObj.orderFailStatus = orderFailStatus;

        return new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
    }

    let paymentAuthResult = new Status(Status.OK);

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
const authorize = function (order, paymentDetails) {
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
