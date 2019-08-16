'use strict';

/**
 * Controller that displays information about customer's Subscribe Pro subscriptions.
 *
 * @module controllers/Subscriptions
 */

/* Script Modules */
var app = require('/app_storefront_controllers/cartridge/scripts/app');
var guard = require('/app_storefront_controllers/cartridge/scripts/guard');

/**
 * Displays a list of customer Subscribe Pro subscriptions.
 *
 * Renders a list of the subscriptions of the current customer (account/subscriptions/mysubscriptions template).
 */
function list() {
    if (!customer.profile.custom.subproCustomerID) {
        response.redirect(request.httpHeaders.referer);
    }

    app.getView({}).render('subpro/account/mysubscriptions');
}

/*
 * Web exposed methods
 */
/** Renders a list of the Subscribe Pro subscriptions of the current customer.
 * @see module:controllers/Subscriptions~list */
exports.List = guard.ensure(['https', 'get', 'loggedIn'], list);
