'use strict';

/**
 * @namespace CheckoutServices
 */

var server = require('server');
server.extend(module.superModule);

var CustomerMgr = require('dw/customer/CustomerMgr');
var BasketMgr = require('dw/order/BasketMgr');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var paymentsHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');
var addressHelper = require('~/cartridge/scripts/subpro/helpers/addressHelper');

var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');

server.append('SubmitPayment', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    if (!subproEnabled) {
        return next();
    }

    this.on('route:Complete', function (req, res) {
        var currentBasket = BasketMgr.getCurrentBasket();
        var billingAddress = currentBasket.billingAddress;
        var viewData = res.getViewData();
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer && req.currentCustomer.profile && req.currentCustomer.profile.customerNo
        );
        if (!customer) {
            return;
        }
        var customerProfile = customer.profile;
        var wallet = customerProfile.getWallet();
        var savedCard;

        if (viewData.storedPaymentUUID) {
            savedCard = paymentsHelper.getPaymentInstrumentById(wallet.paymentInstruments, viewData.storedPaymentUUID);
        } else {
            savedCard = paymentsHelper.getLatestSavedInstrument(wallet.paymentInstruments);
        }

        if (!savedCard) {
            return;
        }

        var address = addressHelper.getCustomerAddress(customer.getAddressBook().getAddresses(), billingAddress) || billingAddress;

        var subscriptionPaymentProfile = paymentsHelper.getSubscriptionPaymentProfile(customerProfile, savedCard, address, false);
        paymentsHelper.findOrCreatePaymentProfile(savedCard, customerProfile, address);

        session.privacy.newCard = JSON.stringify({
            sp: subscriptionPaymentProfile,
            sfcc: savedCard.getUUID()
        });
    });
    next();
});

module.exports = server.exports();
