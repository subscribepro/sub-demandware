'use strict';

var CustomerMgr = require('dw/customer/CustomerMgr');

var customerHelper = require('~/cartridge/scripts/subpro/helpers/customerHelper');
var addressHelper = require('~/cartridge/scripts/subpro/helpers/addressHelper');
var paymentsHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');
var collections = require('*/cartridge/scripts/util/collections');

var profiles;

/**
 * @function beforeStep
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function beforeStep(parameters, stepExecution) {
    var searchPhrase = customerHelper.getCustomerSearchString(parameters);

    profiles = CustomerMgr.searchProfiles(searchPhrase, 'customerNo DESC');
}

/**
 * @function read
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 * @returns {dw.order.Product} product
 */
function read(parameters, stepExecution) {
    while (profiles.hasNext()) {
        var profile = profiles.next();

        return profile.getCustomer();
    }
}

/**
 * @param {dw.order.Product} product
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 * @returns {Object} feedProduct
 */
function process(customer, parameters, stepExecution) {
    if (customer) {
        var profile = customer.getProfile();

        customerHelper.findOrCreateCustomer(customer);
        var customerAddressList = profile.getAddressBook().addresses;
        collections.forEach(customerAddressList, function (customerAddress) {
            addressHelper.findOrCreateAddress(customer, customerAddress);
        });

        var paymentInstruments = profile.getWallet().getPaymentInstruments('CREDIT_CARD');
        collections.forEach(paymentInstruments, function (paymentInstrument) {
            var subscriptionPaymentProfile = paymentsHelper.getSubscriptionPaymentProfile(profile, paymentInstrument, {}, false);

            paymentsHelper.findOrCreatePaymentProfile(paymentInstrument, profile, subscriptionPaymentProfile.billing_address);
        });

        return customer;
    }
}

/**
 * Process chunk
 * @param {Array} lines - lines
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function write(lines, parameters, stepExecution) {}

/**
 * Process chunk
 * @param {Array} lines - lines
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function afterStep(lines, parameters, stepExecution) {}

module.exports = {
    beforeStep: beforeStep,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};
