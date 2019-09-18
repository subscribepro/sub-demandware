'use strict';

var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');

/**
 * Provides an interface to handle Subscribe Pro customer objects and map them to Sales Force Commerce Cloud Customer Object.
 */
var CustomerHelper = {

    /**
     * Take a Sales Force Commerce Cloud Customer Object as a parameter and map any relevant data to Subscribe Pro
     *
     * @param {dw.customer.Customer} customer Sales Force Commerce Cloud Customer Object.
     * @return {Object} an object containing relevant customer fields
     */
    getSubproCustomer: function (customer) {
        var profile = customer.getProfile();

        return {
            email: profile.getEmail(),
            first_name: profile.getFirstName(),
            last_name: profile.getLastName()
        };
    },

    /**
     * Save Subscribe Pro id to Customer Profile
     *
     * @param {dw.customer.Profile} profile Sales Force Commerce Cloud Customer Profile
     * @param {string} subproCustomerID Subscribe Pro Customer ID
     */
    setSubproCustomerID: function (profile, subproCustomerID) {
        try {
            Transaction.wrap(function () {
                profile.custom.subproCustomerID = subproCustomerID;
            });
        } catch (e) {
            Logger.error("Error while updating customer's subproCustomerID attribute", e);
        }
    }
};

module.exports = CustomerHelper;
