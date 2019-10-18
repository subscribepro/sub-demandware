'use strict';

var server = require('server');

var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var CustomerHelper = require('~/cartridge/scripts/subpro/helpers/customerHelper');

var page = module.superModule;
server.extend(page);

server.append('SaveProfile',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
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

module.exports = server.exports();
