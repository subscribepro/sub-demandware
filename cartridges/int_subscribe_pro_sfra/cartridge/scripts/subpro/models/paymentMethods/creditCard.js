'use strict';

/* eslint-disable no-else-return */
/* eslint-disable no-param-reassign */

const Status = require('dw/system/Status');
const HookMgr = require('dw/system/HookMgr');
const constants = require('*/cartridge/scripts/subpro/util/constants');

const getAuthorizationResult = (pProcessor, orderNo, pInstrument) => {
    if (pInstrument.getCreditCardNumber() === constants.failedCard) {
        var status = new Status(Status.ERROR, 'payment_error', 'There was an error processing the payment.');

        // Details should be added for the gateway_type, gateway_error_code, and gateway_error_message,
        // which should be parsed from the gateway transaction response
        status.addDetail('gateway_type', 'braintree');
        status.addDetail('gateway_error_code', '2001');
        status.addDetail('gateway_error_message', 'Insufficient Funds');
        return status;
    }

    const hookName = 'app.payment.processor.' + pProcessor.ID.toLowerCase();
    const customAuthorizeHook = () => HookMgr.callHook(hookName, 'Authorize', orderNo, pInstrument, pProcessor);

    return HookMgr.hasHook(hookName) ? customAuthorizeHook() : HookMgr.callHook('app.payment.processor.default', 'Authorize');
};

/**
 * @description CreditCardModel
 */
function CreditCard() {}

/**
 * Payment Model payment authorization.
 * @param {dw.order.Order} order - API order object
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument - OrderPaymentInstrument
 * @returns {dw.system.Status} authorization status (Status.OK or Status.ERROR)
 */
CreditCard.prototype.authorize = function (order, paymentInstrument) {
    const OrderMgr = require('dw/order/OrderMgr');
    const PaymentMgr = require('dw/order/PaymentMgr');
    const paymentHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');

    const ocapiHelper = require('~/cartridge/scripts/subpro/helpers/ocapiHelper');

    if (paymentHelper.checkIfHasTransaction(paymentInstrument)) {
        let orderFailStatus = OrderMgr.failOrder(order, !order.custom.subproSubscriptionsToBeProcessed);
        let errObj = ocapiHelper.errorResponse({
            status: 'AUTHORIZATION_FAILED',
            message: 'Transaction has already been taken'
        });
        ocapiHelper.fillOrderOcapiError(order, errObj);
        errObj.orderFailStatus = orderFailStatus;

        return new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
    }

    let authorizationResult = null;

    if (paymentHelper.doesAuthorizedAmountBiggerOrderTotal(order, paymentInstrument)) {
        let orderFailStatus = OrderMgr.failOrder(order, !order.custom.subproSubscriptionsToBeProcessed);
        let errObj = ocapiHelper.errorResponse({
            status: 'AUTHORIZATION_ERROR',
            message: 'Authorization amount is bigger than order total'
        });
        ocapiHelper.fillOrderOcapiError(order, errObj);
        errObj.orderFailStatus = orderFailStatus;

        return new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
    }

    const { paymentProcessor } = PaymentMgr.getPaymentMethod(paymentInstrument.paymentMethod);

    if (paymentProcessor) {
        authorizationResult = getAuthorizationResult(paymentProcessor, order.orderNo, paymentInstrument);

        if (authorizationResult.error) {
            let orderFailStatus = OrderMgr.failOrder(order, !order.custom.subproSubscriptionsToBeProcessed);
            let errObj = ocapiHelper.errorResponse({
                status: 'AUTHORIZATION_FAILED',
                message: 'The payment you submitted is not valid. Please re-enter payment information.',
                details: authorizationResult
            });

            ocapiHelper.fillOrderOcapiError(order, errObj);

            errObj.orderFailStatus = orderFailStatus;

            return new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
        }

        return new Status(Status.OK, 'AUTHORIZATION_SUCCESS', JSON.stringify(authorizationResult));
    } else {
        let orderFailStatus = OrderMgr.failOrder(order, !order.custom.subproSubscriptionsToBeProcessed);
        let errObj = ocapiHelper.errorResponse({
            status: 'AUTHORIZATION_FAILED',
            message: 'Payment Processor is empty for provided payment method'
        });
        ocapiHelper.fillOrderOcapiError(order, errObj);
        errObj.orderFailStatus = orderFailStatus;
        return new Status(Status.ERROR, errObj.status, JSON.stringify(errObj));
    }
};

module.exports = CreditCard;
