'use strict';

var server = require('server');

var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var addressHelper = require('~/cartridge/scripts/subpro/helpers/AddressHelper');
var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');

var page = module.superModule;
server.extend(page);

server.append('List', userLoggedIn.validateLoggedIn, consentTracking.consent, function (req, res, next) {
    if (subproEnabled) {
        var viewData = res.getViewData();

        var newAddress = session.privacy.newAddress ? session.privacy.newAddress : null;
        var updatedOldAddress = session.privacy.updatedOldAddress ? session.privacy.updatedOldAddress.sp : null;
        var updatedNewAddress = session.privacy.updatedNewAddress ? session.privacy.updatedNewAddress.sp : null;
        var deletedAddress = session.privacy.deletedAddress ? session.privacy.deletedAddress : null;

        session.privacy.newAddress = null;
        session.privacy.updatedOldAddress = null;
        session.privacy.updatedNewAddress = null;
        session.privacy.deletedAddress = null;

        var newAddressPayload = newAddress ? { address: newAddress.sp } : null;
        var newAddressSfccId = newAddress ? newAddress.sfcc.getID() : null;
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

server.replace('SaveAddress', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var formErrors = require('*/cartridge/scripts/formErrors');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var addressForm = server.forms.getForm('address');
    var addressFormObj = addressForm.toObject();
    addressFormObj.addressForm = addressForm;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    if (addressForm.valid) {
        res.setViewData(addressFormObj);
        this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
            var formInfo = res.getViewData();
            Transaction.wrap(function () {
                var isNewAddress = !req.querystring.addressId;
                var address = !isNewAddress
                    ? addressBook.getAddress(req.querystring.addressId)
                    : addressBook.createAddress(formInfo.addressId);
                if (address) {
                    if (!isNewAddress && subproEnabled) {
                        session.privacy.updatedOldAddress = {
                            sp: addressHelper.getSubproAddress(address, session.customer.profile, true, true),
                            sfcc: address
                        };
                    }

                    if (req.querystring.addressId) {
                        address.setID(formInfo.addressId);
                    }

                    address.setAddress1(formInfo.address1 || '');
                    address.setAddress2(formInfo.address2 || '');
                    address.setCity(formInfo.city || '');
                    address.setFirstName(formInfo.firstName || '');
                    address.setLastName(formInfo.lastName || '');
                    address.setPhone(formInfo.phone || '');
                    address.setPostalCode(formInfo.postalCode || '');

                    if (formInfo.states && formInfo.states.stateCode) {
                        address.setStateCode(formInfo.states.stateCode);
                    }

                    if (formInfo.country) {
                        address.setCountryCode(formInfo.country);
                    }

                    address.setJobTitle(formInfo.jobTitle || '');
                    address.setPostBox(formInfo.postBox || '');
                    address.setSalutation(formInfo.salutation || '');
                    address.setSecondName(formInfo.secondName || '');
                    address.setCompanyName(formInfo.companyName || '');
                    address.setSuffix(formInfo.suffix || '');
                    address.setSuite(formInfo.suite || '');
                    address.setJobTitle(formInfo.title || '');

                    // Send account edited email
                    accountHelpers.sendAccountEditedEmail(customer.profile);

                    if (subproEnabled) {
                        var spAddress = addressHelper.getSubproAddress(address, session.customer.profile, false, true);
                        if (isNewAddress) {
                            session.privacy.newAddress = {
                                sp: spAddress,
                                sfcc: address
                            };
                        } else {
                            session.privacy.updatedNewAddress = {
                                sp: spAddress,
                                sfcc: address
                            };
                        }
                    }

                    res.json({
                        success: true,
                        redirectUrl: URLUtils.url('Address-List').toString()
                    });
                } else {
                    formInfo.addressForm.valid = false;
                    formInfo.addressForm.addressId.valid = false;
                    formInfo.addressForm.addressId.error = Resource.msg('error.message.idalreadyexists', 'forms', null);
                    res.json({
                        success: false,
                        fields: formErrors.getFormErrors(addressForm)
                    });
                }
            });
        });
    } else {
        res.json({
            success: false,
            fields: formErrors.getFormErrors(addressForm)
        });
    }
    return next();
});

server.replace('DeleteAddress', userLoggedIn.validateLoggedInAjax, function (req, res, next) {
    var CustomerMgr = require('dw/customer/CustomerMgr');
    var Transaction = require('dw/system/Transaction');
    var accountHelpers = require('*/cartridge/scripts/helpers/accountHelpers');

    var data = res.getViewData();
    if (data && !data.loggedin) {
        res.json();
        return next();
    }

    var addressId = req.querystring.addressId;
    var isDefault = req.querystring.isDefault;
    var customer = CustomerMgr.getCustomerByCustomerNumber(
        req.currentCustomer.profile.customerNo
    );
    var addressBook = customer.getProfile().getAddressBook();
    var address = addressBook.getAddress(addressId);
    var UUID = address.getUUID();
    this.on('route:BeforeComplete', function () { // eslint-disable-line no-shadow
        var length;
        Transaction.wrap(function () {
            if (subproEnabled) {
                session.privacy.deletedAddress = {
                    sp: addressHelper.getSubproAddress(address, session.customer.profile, true, true),
                    sfcc: address
                };
            }

            addressBook.removeAddress(address);
            length = addressBook.getAddresses().length;
            if (isDefault && length > 0) {
                var newDefaultAddress = addressBook.getAddresses()[0];
                addressBook.setPreferredAddress(newDefaultAddress);
            }
        });

        // Send account edited email
        accountHelpers.sendAccountEditedEmail(customer.profile);

        if (length === 0) {
            res.json({
                UUID: UUID,
                defaultMsg: Resource.msg('label.addressbook.defaultaddress', 'account', null),
                message: Resource.msg('msg.no.saved.addresses', 'address', null)
            });
        } else {
            res.json({
                UUID: UUID,
                defaultMsg: Resource.msg('label.addressbook.defaultaddress', 'account', null)
            });
        }
    });
    return next();
});


module.exports = server.exports();
