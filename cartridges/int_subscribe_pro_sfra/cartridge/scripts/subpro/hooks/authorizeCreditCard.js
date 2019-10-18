var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');

/*
 * authorizing credit card payment instrument
 * Hook: dw.ocapi.shop.order.authorizeCreditCard
 * */
exports.authorizeCreditCard = function (order, paymentDetails, cvn) {
    // Attempt to process the transaction

    // If it fails, fail the order
    Transaction.wrap(function () {
        OrderMgr.failOrder(order, false);
    });

    // If it fails, return a Status with an ERROR type.

    // The Status error code should be 'payment_error'
    // The Status error message should be a generic message about failure to process the payment.
    var status = new Status(Status.ERROR, 'payment_error', 'There was an error processing the payment.');

    // Details should be added for the gateway_type, gateway_error_code, and gateway_error_message,
    // which should be parsed from the gateway transaction response
    status.addDetail('gateway_type', 'braintree');
    status.addDetail('gateway_error_code', '2001');
    status.addDetail('gateway_error_message', 'Insufficient Funds');

    return status;
};
