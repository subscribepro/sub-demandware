var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
// var PaymentMgr = require('dw/order/PaymentMgr');
// var HookMgr = require('dw/system/HookMgr');
// var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
// var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
// var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

/**
 * Throw an error as a string representation of a JSON object containing an error code and a message.
 * @param {string} errorCode The error code
 * @param {string} errorMessage The error message
 */
function throwError(errorCode, errorMessage) {
    var error = {
        code: errorCode,
        message: errorMessage
    };
    throw new Error(JSON.stringify(error));
}

/*
 * authorizing credit card payment instrument
 * Hook: dw.ocapi.shop.order.authorizeCreditCard
 * */
exports.authorizeCreditCard = function (order, paymentDetails, cvn) {
    try {
        throwError('SP_SOFT_DECLINE', 'payment handle processing failed');

    } catch (e) {
        Logger.error('authorizeCreditCard order ' + order.orderNo + ', error:' + e.message);
        // Transaction.wrap(function () {
        //     order.getCustom().ocapiError = e.message;
        // });
        // Transaction.wrap(function () {
        //     OrderMgr.failOrder(order);
        // });
        return new Status(Status.ERROR, 'authorizeCreditCard error:' + e.message);
    }

    return new Status(Status.OK);
};
