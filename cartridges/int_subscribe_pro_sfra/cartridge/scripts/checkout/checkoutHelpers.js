'use strict';

/* eslint-disable no-param-reassign */
var originalExports = Object.keys(module.superModule || {});

originalExports.forEach(function (originalExport) {
    module.exports[originalExport] = module.superModule[originalExport];
});

var base = module.exports;

var Transaction = require('dw/system/Transaction');
var Order = require('dw/order/Order');

/**
 * updateOrderPaymentStatus
 * @param {dw.order.Order} order - the order object
 * @returns {void}
 */
function updateOrderPaymentStatus(order) {
    var paymentsHelper = require('*/cartridge/scripts/subpro/helpers/paymentsHelper');

    var totalGrossPrice = order.getTotalGrossPrice();
    var amountPaid = paymentsHelper.calculateProcessedPaymentsAmount(order);

    Transaction.wrap(function () {
        if (amountPaid && totalGrossPrice.equals(amountPaid)) {
            order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
        } else if (amountPaid && amountPaid.getValue()) {
            order.setPaymentStatus(Order.PAYMENT_STATUS_PARTPAID);
        } else {
            order.setPaymentStatus(Order.PAYMENT_STATUS_NOTPAID);
        }
    });
}

base.updateOrderPaymentStatus = updateOrderPaymentStatus;

module.exports = base;
