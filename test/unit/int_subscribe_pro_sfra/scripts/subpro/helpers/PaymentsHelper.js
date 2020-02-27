var assert = require('chai').assert;
var loggerMock = require('../../../../../mocks/dw/system/Logger');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var transactionMock = require('../../../../../mocks/dw/system/Transaction');
var subscribeProLibMock = require('../../../../../mocks/scripts/SubscribeProLibMock');
var PaymentMgr = require('../../../../../mocks/dw/order/PaymentMgr');
var OrderPaymentInstrument = require('../../../../../mocks/dw/order/OrderPaymentInstrument');
var OrderAddress = require('../../../../../mocks/dw/order/OrderAddress');
var paymentsHelper = proxyquire('../../../../../../cartridges/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/paymentsHelper', {
    'dw/system/Logger': loggerMock,
    'dw/system/Transaction': transactionMock,
    'dw/order/PaymentMgr': PaymentMgr,
    '~/cartridge/scripts/subpro/lib/subscribeProLib': subscribeProLibMock
});
var paymentsMockData = require('../../../../../mocks/scripts/PaymentProfileMockData');
var customerMockData = require('../../../../../mocks/scripts/CustomerMockData');

describe('paymentsHelper', function () {
    it('getSubscriptionPaymentProfile should return an object formatted as an SP payment profile', function () {
        var paymentProfile = paymentsHelper.getSubscriptionPaymentProfile(
            customerMockData.sfccCustomer.getProfile(),
            OrderPaymentInstrument,
            OrderAddress,
            true
        );
        assert.deepEqual(paymentProfile, paymentsMockData.spPaymentProfile);
    });

    it('setSubproPaymentProfileID should update the SP ID for the payment profile corresponding to the payment instrument', function () {
        paymentsHelper.setSubproPaymentProfileID(paymentsMockData.sfccPaymentInstrument, 214365);
        assert.equal(paymentsMockData.sfccPaymentInstrument.custom.subproPaymentProfileID, 214365);
        // revert the change
        paymentsHelper.setSubproPaymentProfileID(paymentsMockData.sfccPaymentInstrument, 124365);
    });

    it('comparePaymentInstruments should return true if both payment instruments are the same, otherwise false', function () {
        assert.isTrue(paymentsHelper.comparePaymentInstruments(paymentsMockData.sfccPaymentInstrument, paymentsMockData.sfccPaymentInstrument));
        assert.isFalse(paymentsHelper.comparePaymentInstruments(paymentsMockData.sfccPaymentInstrument, {
            paymentMethod: 'CREDIT_CARD',
            creditCardNumber: '4111111111111116',
            creditCardHolder: 'Mock Data',
            creditCardExpirationYear: '2026',
            creditCardExpirationMonth: '05'
        }));
    });

    it('getCustomerPaymentInstrument should get the payment instrument object that matches the given object', function () {
        var selectedPaymentInstrument = paymentsHelper.getCustomerPaymentInstrument(paymentsMockData.wallet, paymentsMockData.sfccPaymentInstrument);
        assert.isTrue(paymentsHelper.comparePaymentInstruments(selectedPaymentInstrument, paymentsMockData.sfccPaymentInstrument));
    });

    it('findOrCreatePaymentProfile should return the ID of the created payment profile in SP', function () {
        var paymentProfileId = paymentsHelper.findOrCreatePaymentProfile(paymentsMockData.sfccPaymentInstrument, paymentsMockData.sfccPaymentInstrument, customerMockData.sfccCustomer.getProfile(), {});
        assert.equal(paymentProfileId, 124365);
    });

    it('createSubproPaymentProfile should return a payment profile ID', function () {
        var paymentProfileId = paymentsHelper.createSubproPaymentProfile(customerMockData.sfccCustomer.getProfile(), paymentsMockData.sfccPaymentInstrument, {});
        assert.equal(paymentProfileId, 54321);
    });
});
