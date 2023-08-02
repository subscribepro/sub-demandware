'use strict';

/* eslint-disable no-param-reassign */

var Status = require('dw/system/Status');

/**
 * validateOrder
 * @param {Object} OCAPIOrderObj - the modified order.
 * @returns {dw.system.Status} order place status (Status.OK or status.ERROR).
 */
function validateOrder(OCAPIOrderObj) {
    var OrderMgr = require('dw/order/OrderMgr');
    var order = !empty(OCAPIOrderObj.orderNo) ? OrderMgr.getOrder(OCAPIOrderObj.orderNo) : null;

    if (!empty(order) && order.custom.subproIsRecurringOrder) {
        var paymentHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

        var totalGrossPrice = order.getTotalGrossPrice();
        var amountPaid = paymentHelper.calculateProcessedPaymentsAmount(order);

        if (amountPaid && totalGrossPrice.equals(amountPaid)) {
            COHelpers.sendConfirmationEmail(order, request.locale);
        }
    }

    return new Status(Status.OK);
}

module.exports = {
    validateOrder: validateOrder
};
