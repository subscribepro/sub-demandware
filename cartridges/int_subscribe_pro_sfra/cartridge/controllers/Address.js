'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var addressHelper = require('~/cartridge/scripts/subpro/helpers/addressHelper');
var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');

var page = module.superModule;
server.extend(page);

server.append('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    if (subproEnabled) {
        var viewData = res.getViewData();

        var newAddress = session.privacy.newAddress ? JSON.parse(session.privacy.newAddress) : null;
        var updatedOldAddress = session.privacy.updatedOldAddress ? JSON.parse(session.privacy.updatedOldAddress).sp : null;
        var updatedNewAddress = session.privacy.updatedNewAddress ? JSON.parse(session.privacy.updatedNewAddress).sp : null;
        var deletedAddress = session.privacy.deletedAddress ? JSON.parse(session.privacy.deletedAddress) : null;

        session.privacy.newAddress = null;
        session.privacy.updatedOldAddress = null;
        session.privacy.updatedNewAddress = null;
        session.privacy.deletedAddress = null;

        var newAddressPayload = newAddress ? { address: newAddress.sp } : null;
        var newAddressSfccId = newAddress ? newAddress.sfcc : null;
        var updatedAddressPayload = updatedOldAddress && updatedNewAddress ? { prev_address: updatedOldAddress, address: updatedNewAddress } : null;
        var deletedAddressPayload = deletedAddress ? { address: deletedAddress.sp } : null;

        viewData.newAddress = JSON.stringify(newAddressPayload);
        viewData.newAddressSfccId = newAddressSfccId;
        viewData.updatedAddress = JSON.stringify(updatedAddressPayload);
        viewData.deletedAddress = JSON.stringify(deletedAddressPayload);

        res.setViewData(viewData);
    }
    next();
});

server.get('SetSPAddressID', function (req, res, next) {
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(req.querystring.addressId);
    addressHelper.setSubproAddressID(address, req.querystring.spAddressId);
    res.json({ success: true });
    next();
});

server.prepend('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    if (!subproEnabled) {
        return next();
    }
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();

    // Make sure our append() function knows whether we're creating or updating
    var isNewAddress = !req.querystring.addressId;
    session.privacy.spUpdateAddress = !isNewAddress;
    if (isNewAddress) {
        return next();
    }

    var address = addressBook.getAddress(req.querystring.addressId);

    if (!address) {
        return next();
    }

    session.privacy.updatedOldAddress = JSON.stringify({
        sp: addressHelper.getSubproAddress(address, session.customer.profile, true, true),
        sfcc: address.ID
    });

    return next();
});

server.append('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    this.on('route:Complete', function () {
        if (!subproEnabled) {
            return next();
        }
        var CustomerMgr = require('dw/customer/CustomerMgr');
        var addressForm = server.forms.getForm('address');
        var addressFormObj = addressForm.toObject();
        addressFormObj.addressForm = addressForm;
        var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
        var addressBook = customer.getProfile().getAddressBook();

        var addressId = req.querystring.addressId ? req.querystring.addressId : addressFormObj.addressId;
        if (!addressId) {
            return next();
        }
        var address = addressBook.getAddress(addressId);
        if (!address) {
            return next();
        }

        var spAddress = addressHelper.getSubproAddress(address, session.customer.profile, false, true);
        if (session.privacy.spUpdateAddress) {
            session.privacy.updatedNewAddress = JSON.stringify({
                sp: spAddress,
                sfcc: address.ID
            });
        } else {
            session.privacy.newAddress = JSON.stringify({
                sp: spAddress,
                sfcc: address.ID
            });
        }

        session.privacy.spUpdateAddress = null;
    });
    return next();
});

server.prepend('DeleteAddress', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var addressId = req.querystring.addressId;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    if (subproEnabled) {
        session.privacy.deletedAddress = JSON.stringify({
            sp: addressHelper.getSubproAddress(address, session.customer.profile, true, true),
            sfcc: address.ID
        });
    }

    return next();
});

module.exports = server.exports();
