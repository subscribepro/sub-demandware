'use strict';

/* eslint no-unused-vars: 0 */

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var paymentsHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');
var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');

var page = module.superModule;
server.extend(page);

/**
 * Checks if a credit card is valid or not
 * @param {Object} card - plain object with card details
 * @param {Object} form - form object
 * @returns {boolean} a boolean representing card validation
 */
function verifyCard(card, form) {
    var collections = require('*/cartridge/scripts/util/collections');
    var Resource = require('dw/web/Resource');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var PaymentStatusCodes = require('dw/order/PaymentStatusCodes');

    var paymentCard = PaymentMgr.getPaymentCard(card.cardType);
    var error = false;
    var cardNumber = card.cardNumber;
    var creditCardStatus;
    var formCardNumber = form.cardNumber;

    if (paymentCard) {
        creditCardStatus = paymentCard.verify(
            card.expirationMonth,
            card.expirationYear,
            cardNumber
        );
    } else {
        formCardNumber.valid = false;
        formCardNumber.error = Resource.msg('error.message.creditnumber.invalid', 'forms', null);
        error = true;
    }

    if (creditCardStatus && creditCardStatus.error) {
        collections.forEach(creditCardStatus.items, function (item) {
            switch (item.code) {
                case PaymentStatusCodes.CREDITCARD_INVALID_CARD_NUMBER:
                    formCardNumber.valid = false;
                    formCardNumber.error = Resource.msg('error.message.creditnumber.invalid', 'forms', null);
                    error = true;
                    break;

                case PaymentStatusCodes.CREDITCARD_INVALID_EXPIRATION_DATE:
                    var expirationMonth = form.expirationMonth;
                    var expirationYear = form.expirationYear;
                    expirationMonth.valid = false;
                    expirationMonth.error = Resource.msg('error.message.creditexpiration.expired', 'forms', null);
                    expirationYear.valid = false;
                    error = true;
                    break;
                default:
                    error = true;
            }
        });
    }
    return error;
}

/**
 * Creates an object from form values
 * @param {Object} paymentForm - form object
 * @returns {Object} a plain object of payment instrument
 */
function getDetailsObject(paymentForm) {
    return {
        name: paymentForm.cardOwner.value,
        cardNumber: paymentForm.cardNumber.value,
        cardType: paymentForm.cardType.value,
        expirationMonth: paymentForm.expirationMonth.value,
        expirationYear: paymentForm.expirationYear.value,
        paymentForm: paymentForm
    };
}

/**
 * Creates a list of expiration years from the current year
 * @returns {List} a plain list of expiration years from current year
 */
function getExpirationYears() {
    var currentYear = new Date().getFullYear();
    var creditCardExpirationYears = [];

    for (var i = 0; i < 10; i++) {
        creditCardExpirationYears.push((currentYear + i).toString());
    }

    return creditCardExpirationYears;
}

server.append('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    if (subproEnabled) {
        var viewData = res.getViewData();

        var newCard = session.privacy.newCard ? session.privacy.newCard : null;
        var deletedCard = session.privacy.deletedCard ? session.privacy.deletedCard : null;

        session.privacy.newCard = null;
        session.privacy.deletedCard = null;

        var newCardSfccId = newCard ? newCard.sfcc.getUUID() : null;
        var newCardPayload = newCard ? { payment_profile: newCard.sp } : null;
        var deletedCardPayload = deletedCard ? { payment_profile: deletedCard.sp } : null;

        viewData.newCardSfccId = newCardSfccId;
        viewData.newCard = JSON.stringify(newCardPayload);
        viewData.deletedCard = JSON.stringify(deletedCardPayload);

        res.setViewData(viewData);
    }
    next();
});

server.get('SetSPPaymentProfileID', function (req, res, next) {
    var wallet = customer.getProfile().getWallet();
    var paymentInstruments = wallet.getPaymentInstruments('CREDIT_CARD');
    var paymentInstrumentId = req.querystring.paymentInstrumentId;

    var paymentInstrument = null;
    for (var i in paymentInstruments) {
        if (paymentInstrumentId == paymentInstruments[i].getUUID()) {
            paymentInstrument = paymentInstruments[i];
        }
    }

    var success = paymentInstrument != null;

    if (success) {
        paymentsHelper.setSubproPaymentProfileID(paymentInstrument, req.querystring.spPaymentProfileId);
    }
    res.json({ success: success });
    next();
});

server.replace('SavePayment', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var formErrors = require('*/cartridge/scripts/formErrors');
    var HookMgr = require('dw/system/HookMgr');
    var PaymentMgr = require('dw/order/PaymentMgr');
    var dwOrderPaymentInstrument = require('dw/order/PaymentInstrument');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var paymentForm = server.forms.getForm('creditCard');
    var result = getDetailsObject(paymentForm);

    if (paymentForm.valid && !verifyCard(result, paymentForm)) {
        res.setViewData(result);
        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var URLUtils = require('dw/web/URLUtils');
            var CustomerMgr = require('dw/customer/CustomerMgr');
            var Transaction = require('dw/system/Transaction');

            var formInfo = res.getViewData();
            var customer = CustomerMgr.getCustomerByCustomerNumber(
                req.currentCustomer.profile.customerNo
            );
            var wallet = customer.getProfile().getWallet();

            Transaction.wrap(function () {
                var paymentInstrument = wallet.createPaymentInstrument(dwOrderPaymentInstrument.METHOD_CREDIT_CARD);
                paymentInstrument.setCreditCardHolder(formInfo.name);
                paymentInstrument.setCreditCardNumber(formInfo.cardNumber);
                paymentInstrument.setCreditCardType(formInfo.cardType);
                paymentInstrument.setCreditCardExpirationMonth(formInfo.expirationMonth);
                paymentInstrument.setCreditCardExpirationYear(formInfo.expirationYear);

                var processor = PaymentMgr.getPaymentMethod(dwOrderPaymentInstrument.METHOD_CREDIT_CARD).getPaymentProcessor();
                var token = HookMgr.callHook(
                    'app.payment.processor.' + processor.ID.toLowerCase(),
                    'createToken'
                );

                paymentInstrument.setCreditCardToken(token);

                session.privacy.newCard = {
                    sp: paymentsHelper.getSubscriptionPaymentProfile(session.customer.profile, paymentInstrument, {}, false),
                    sfcc: paymentInstrument
                };
            });

            // Send account edited email
            accountHelpers.sendAccountEditedEmail(customer.profile);

            res.json({
                success: true,
                redirectUrl: URLUtils.url('PaymentInstruments-List').toString()
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(paymentForm)
        });
    }
    return next();
});

server.prepend('DeletePayment', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var array = require('*/cartridge/scripts/util/array');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var UUID = req.querystring.UUID;
    var paymentInstruments = req.currentCustomer.wallet.paymentInstruments;
    var payment = array.find(paymentInstruments, function (item) {
        return UUID === item.UUID;
    });
    session.privacy.deletedCard = {
        sp: paymentsHelper.getSubscriptionPaymentProfile(session.customer.profile, payment.raw, {}, true),
        sfcc: payment
    };

    return next();
});

module.exports = server.exports();
