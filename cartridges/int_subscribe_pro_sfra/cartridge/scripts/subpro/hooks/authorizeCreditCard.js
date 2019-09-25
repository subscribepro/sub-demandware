var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
// var PaymentMgr = require('dw/order/PaymentMgr');
// var HookMgr = require('dw/system/HookMgr');
// var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
// var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
// var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

/*
 * authorizing credit card payment instrument
 * Hook: dw.ocapi.shop.order.authorizeCreditCard
 * */
exports.authorizeCreditCard = function (order, paymentDetails, cvn) {

    // Attempt to process the transaction

    // If it fails, return a Status with an ERROR type.
    // The error code should be 'payment_error'
    // The error message should be the error message from the gateway response
    // A detail should be added to the status with the name being error_code from the gateway, and the value being the error message.
    Transaction.wrap(function () {
        OrderMgr.failOrder(order);
    });

    var status = new Status(Status.ERROR, 'error code', 'error message');
    status.addDetail('detail1', { key: 'value' });
    status.addDetail('detail2', 'string2');
    status.addDetail('detail3', true);
    status.addDetail('detaul4', 500);

    return status;
};
