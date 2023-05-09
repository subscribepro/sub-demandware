'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');
var Order = require('dw/order/Order');
var HookMgr = require('dw/system/HookMgr');

var paymentHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var ocapiHelper = require('~/cartridge/scripts/subpro/helpers/ocapiHelper');

/**
 * placeAnOrder
 * @param {dw.order.Order} order - the modified order.
 * @param {boolean} skipAuthorization - should authorization  be skipped.
 * @returns {dw.system.Status} status (Status.OK or status.ERROR).
 */
function placeAnOrder(order, skipAuthorization) {
    var status = new Status(Status.OK);

    if (skipAuthorization) {
        var paymentInstruments = order.getPaymentInstruments();
        for (var i = 0; i < paymentInstruments.length; i++) {
            var paymentInstrument = paymentInstruments[i];
            paymentInstrument.paymentTransaction.setTransactionID(order.orderNo);
        }
        order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
    }

    var placeOrderResult = COHelpers.placeOrder(order, { status: 'success' });

    if (placeOrderResult.error) {
        var orderFailStatus = OrderMgr.failOrder(order, false);
        var errObj = ocapiHelper.errorResponse({
            status: 'UNSUPPORTED_PAYMENT_TYPE',
            message: 'Unexpected payment type'
        });
        errObj.orderFailStatus = orderFailStatus;

        status = new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
    }

    if (HookMgr.hasHook('app.after.order.placed')) {
        HookMgr.callHook('app.after.order.placed', 'afterPlaceOrder', order.orderNo);
    }

    return status;
}

/**
 * The hook is called after a payment instrument is patched.
 * @param {dw.order.Order} order - the modified order.
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument - the updated payment instrument.
 * @param {OrderPaymentInstrumentRequest} newPaymentInstrument - the new payment instrument data.
 * @param {boolean} successfullyAuthorized - was the payment instrument successfully authorized.
 * @returns {dw.system.Status} authorization status (Status.OK or status.ERROR).
 */
function afterPATCH(order, paymentInstrument, newPaymentInstrument, successfullyAuthorized) {
    var statusOK = new Status(Status.OK);
    var httpParameters = request.httpParameters;
    var totalGrossPrice = order.getTotalGrossPrice();

    var skipAuthorization = httpParameters.get('skip_authorization');

    if (!empty(skipAuthorization)) {
        skipAuthorization = skipAuthorization[0];
    }

    if (skipAuthorization === 'true') {
        var amountSet = paymentHelper.calculateAllPaymentsAmount(order);
        if (amountSet && totalGrossPrice.equals(amountSet)) {
            return placeAnOrder(order, true);
        }
    }

    if (successfullyAuthorized && order.getStatus().getValue() === Order.ORDER_STATUS_CREATED) {
        var amountPaid = paymentHelper.calculateProcessedPaymentsAmount(order);

        if (amountPaid && totalGrossPrice.equals(amountPaid)) {
            return placeAnOrder(order);
        }
    }

    return statusOK;
}

/**
 * afterPatchPaymentInstrument OCAPI VERSION 17.3
 * @param {dw.order.Order} order - the modified order.
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument - paymentInstrument
 * @param {dw.order.OrderPaymentInstrumentRequest} paymentInstrumentRequest - paymentInstrumentRequest
 * @returns {dw.system.Status} order place status (Status.OK or status.ERROR).
 */
function afterPatchPaymentInstrument(order, paymentInstrument, paymentInstrumentRequest) {
    //eslint-disable-line
    var statusOK = new Status(Status.OK);
    var httpParameters = request.httpParameters;
    var totalGrossPrice = order.getTotalGrossPrice();

    var skipAuthorization = httpParameters.get('skip_authorization');

    if (!empty(skipAuthorization)) {
        skipAuthorization = skipAuthorization[0];
    }

    if (skipAuthorization === 'true') {
        var amountSet = paymentHelper.calculateAllPaymentsAmount(order);
        if (amountSet && totalGrossPrice.equals(amountSet)) {
            return placeAnOrder(order, true);
        }
    }

    if (order.getStatus().getValue() === Order.ORDER_STATUS_CREATED) {
        var amountPaid = paymentHelper.calculateProcessedPaymentsAmount(order);
        if (amountPaid && totalGrossPrice.equals(amountPaid)) {
            return placeAnOrder(order);
        }
    }

    return statusOK;
}

/**
 * beforePOST
 * @param {dw.order.Basket} basket - current basket.
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument - paymentInstrument
 * @returns {dw.system.Status} payment instrument add status (Status.OK or status.ERROR).
 */
function beforePOST(basket, paymentInstrument) {
    var paymentMethodsFactory = require('~/cartridge/scripts/subpro/factories/paymentMethodsFactory');

    var PaymentMethodModel = paymentMethodsFactory[paymentInstrument.paymentMethodId];

    if (!empty(PaymentMethodModel) && !empty(PaymentMethodModel.beforePOST)) {
        return PaymentMethodModel.beforePOST(basket, paymentInstrument);
    }
    return new Status(Status.OK);
}

module.exports = {
    afterPatchPaymentInstrument: afterPatchPaymentInstrument,
    afterPATCH: afterPATCH,
    beforePOST: beforePOST
};
