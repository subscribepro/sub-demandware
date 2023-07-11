'use strict';

/* eslint-disable no-param-reassign */

var CustomerHelper = require('~/cartridge/scripts/subpro/helpers/customerHelper');
var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');

/**
 * registerSPUser
 * @param {Object} customer - the customer to save.
 * @returns {string} customerSubproID or null if subproEnabled === false
 */
function findOrCreateSPUser(customer) {
    if (subproEnabled) {
        /**
         * Validate / Create the customer
         * If the customer already has a reference to a Subscribe Pro customer
         * Validate that the customer does in fact exist and if it doesn't or a
         * customer hasn't been created yet, create one
         * Else call service to create customer record
         */

        return CustomerHelper.findOrCreateCustomer(customer);
    }
}

module.exports = {
    findOrCreateSPUser: findOrCreateSPUser
};
