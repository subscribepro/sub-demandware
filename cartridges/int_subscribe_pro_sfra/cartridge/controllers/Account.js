'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var CustomerHelper = require('~/cartridge/scripts/subpro/helpers/customerHelper');
var HookMgr = require('dw/system/HookMgr');

server.extend(module.superModule);

server.append('SaveProfile', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    if (customer.getProfile().custom.subproCustomerID) {
        var profileForm = server.forms.getForm('profile');
        CustomerHelper.updateCustomerInPlatform(customer.getProfile().custom.subproCustomerID, {
            email: profileForm.customer.email.value,
            first_name: profileForm.customer.firstname.value,
            last_name: profileForm.customer.lastname.value,
            platform_specific_customer_id: customer.getProfile().getCustomerNo()
        });
    }
    next();
});

server.append('Login', server.middleware.https, function (req, res, next) {
    var customerSubproID = customer.getProfile().custom.subproCustomerID;
    if (HookMgr.hasHook('app.registration.user.SPUser') && !customerSubproID) {
        HookMgr.callHook('app.registration.user.SPUser', 'findOrCreateSPUser', customer);
    }
    next();
});

server.append('SubmitRegistration', server.middleware.https, csrfProtection.validateAjaxRequest, function (req, res, next) {
    this.on('route:BeforeComplete', function (req, res) {
        if (HookMgr.hasHook('app.registration.user.SPUser') && customer.getProfile()) {
            HookMgr.callHook('app.registration.user.SPUser', 'findOrCreateSPUser', customer);
        }
        // eslint-disable-line no-shadow
    });
    next();
});

module.exports = server.exports();
