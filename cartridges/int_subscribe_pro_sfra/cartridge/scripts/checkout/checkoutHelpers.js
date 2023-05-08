'use strict';

/* eslint-disable no-param-reassign */
let originalExports = Object.keys(module.superModule || {});

originalExports.forEach(function (originalExport) {
    module.exports[originalExport] = module.superModule[originalExport];
});

const base = module.exports;

const Transaction = require('dw/system/Transaction');
const URLUtils = require('dw/web/URLUtils');
const PaymentMgr = require('dw/order/PaymentMgr');
const HookMgr = require('dw/system/HookMgr');
const Order = require('dw/order/Order');
const Money = require('dw/value/Money');

const constants = require('*/cartridge/scripts/subpro/util/constants');

/**
 * @description Calculates sum of payments in context of specified order
 * @param {dw.order.Order} order specified order
 * @param {boolean} paidOnly determines if only paid transactions should be calculated
 * @returns {dw.value.Money} sum of all payments
 */
const calculatePaymentsAmount = function (order, paidOnly) {
    const constants = require('*/cartridge/scripts/subpro/util/constants');

    let currencyCode = order.getCurrencyCode();
    let amountPaid = new Money(0, currencyCode);
    let paymentInstrumentsIterator = order.getPaymentInstruments().iterator();
    while (paymentInstrumentsIterator.hasNext()) {
        let currentPaymentInstrument = paymentInstrumentsIterator.next();
        let paymentTransaction = currentPaymentInstrument.getPaymentTransaction();
        if (paidOnly && !empty(paymentTransaction) && !empty(paymentTransaction.custom.transactionStatus) && paymentTransaction.custom.transactionStatus.value !== constants.paymentTransactionStatuses.PAID) {
            continue; // eslint-disable-line
        }
        if (paymentTransaction) {
            amountPaid = amountPaid.add(paymentTransaction.getAmount());
        }
    }
    return amountPaid;
};

/**
 * updateOrderPaymentStatus
 * @param {dw.order.Order} order - the order object
 * @returns {void}
 */
function updateOrderPaymentStatus(order) {
    const paymentsHelper = require('*/cartridge/scripts/subpro/helpers/paymentsHelper');

    const totalGrossPrice = order.getTotalGrossPrice();
    const amountPaid = calculatePaymentsAmount(order, true);

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

/**
 * getAllPaymentInstrumentsByTransactionStatus
 * @param {dw.order.Order} order - the order object
 * @param {string} status - The order number for the order
 * @returns {Array<dw.order.OrderPaymentInstrument>}
 */
function getAllPaymentInstrumentsByTransactionStatus(order, status) {
    const filteredPaymentInstruments = [];
    const paymentInstruments = order.getPaymentInstruments();
    for (let i = 0; i < paymentInstruments.length; i++) {
        let paymentInstrument = paymentInstruments[i];
        if (!empty(paymentInstrument.paymentTransaction.custom.transactionStatus) && paymentInstrument.paymentTransaction.custom.transactionStatus.value === status) {
            filteredPaymentInstruments.push(paymentInstrument);
        }
    }
    return filteredPaymentInstruments;
}

/**
 * cancelPaymentInstrumentsTransaction
 * @param {dw.order.Order} order - the order object
 * @param {Array<dw.order.OrderPaymentInstrument>} paymentInstruments - The order number for the order
 * @param {boolean} useAttempts - Use attempts or not
 * @returns {Object} result object
 */
function cancelPaymentInstrumentsTransaction(order, paymentInstruments, useAttempts) {
    const result = { error: false };
    for (let i = 0; i < paymentInstruments.length; i++) {
        let paymentInstrument = paymentInstruments[i];
        let paymentProcessor = PaymentMgr.getPaymentMethod(paymentInstrument.paymentMethod).paymentProcessor;
        let hookName = 'app.payment.processor.' + paymentProcessor.ID.toLowerCase();

        if (HookMgr.hasHook(hookName)) {
            let cancellationResult = HookMgr.callHook(hookName, 'Cancel', order.getOrderNo(), paymentInstrument, paymentProcessor);
            // eslint-disable-next-line no-loop-func
            Transaction.wrap(function () {
                if (!cancellationResult.error) {
                    paymentInstrument.paymentTransaction.custom.transactionStatus = constants.paymentTransactionStatuses.CANCELED;
                } else {
                    paymentInstrument.paymentTransaction.custom.transactionStatus = constants.paymentTransactionStatuses.FAILED;
                    result.error = true;
                }

                if (useAttempts) {
                    paymentInstrument.paymentTransaction.custom.transactionsRetry += 1;
                }
            });
        }

        // eslint-disable-next-line no-loop-func
        Transaction.wrap(function () {
            if (result.error) {
                order.custom.paymentCancellationStatus = constants.paymentCancellationStatus.PARTCANCELED;
            } else {
                order.custom.paymentCancellationStatus = constants.paymentCancellationStatus.CANCELED;
            }
        });
    }
    updateOrderPaymentStatus(order);
    return result;
}

/**
 * cancelAllPaidTransactions
 * @param {dw.order.Order} order - the order object
 * @returns {Object} result object
 */
function cancelAllPaidTransactions(order) {
    const paymentInstruments = getAllPaymentInstrumentsByTransactionStatus(order, constants.paymentTransactionStatuses.PAID);
    return cancelPaymentInstrumentsTransaction(order, paymentInstruments);
}

base.cancelAllPaidTransactions = cancelAllPaidTransactions;
base.updateOrderPaymentStatus = updateOrderPaymentStatus;

module.exports = base;
