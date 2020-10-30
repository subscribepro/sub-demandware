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

        var newCard = session.privacy.newCard ? JSON.parse(session.privacy.newCard) : null;
        var deletedCard = session.privacy.deletedCard ? JSON.parse(session.privacy.deletedCard) : null;

        session.privacy.newCard = null;
        session.privacy.deletedCard = null;

        var newCardSfccId = newCard ? newCard.sfcc : null;
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

server.append('SavePayment', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    if (!subproEnabled) {
        return next();
    }
    this.on('route:Complete', function (req, res) { // eslint-disable-line no-shadow
        var viewData = res.getViewData();
        var cardNum = viewData.cardNumber;
        var last4 = cardNum.substring(cardNum.length - 4);
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
        var wallet = customer.getProfile().getWallet();
        var savedCard = null;
        var savedCards = wallet.getPaymentInstruments('CREDIT_CARD');
        for (var i = 0; i < savedCards.length; i++) {
            if (savedCards[i].getCreditCardNumberLastDigits() == last4) {
                savedCard = savedCards[i];
                break;
            }
        }
        if (!savedCard) {
            return next();
        }

        session.privacy.newCard = JSON.stringify({
            sp: paymentsHelper.getSubscriptionPaymentProfile(session.customer.profile, savedCard, {}, false),
            sfcc: savedCard.getUUID()
        });
    });
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
    session.privacy.deletedCard = JSON.stringify({
        sp: paymentsHelper.getSubscriptionPaymentProfile(session.customer.profile, payment.raw, {}, true),
        sfcc: payment.UUID
    });

    return next();
});

module.exports = server.exports();
