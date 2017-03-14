'use strict';

let Transaction = require('dw/system/Transaction');

/**
 * Provides an interface to handle Subscribe Pro customer objects and map them to Sales Force Commerce Cloud Customer Object.
 */
let CustomerHelper = {

    /**
     * Take a Sales Force Commerce Cloud Customer Object as a parameter and map any relevant data to Subscribe Pro
     *
     * @param {dw.customer.Customer} customer Sales Force Commerce Cloud Customer Object.
     *
     * @return Object an object containing relevant customer fields
     */
    getSubproCustomer: function(customer) {
        const profile = customer.getProfile();

        let subproCustomerID;

        try {
            subproCustomerID = profile.custom.subproCustomerID;
        } catch (e) {
            require('dw/system/Logger').error(e);
            subproCustomerID = '';
        }

        return {
            "id": subproCustomerID,
            "email": profile.getEmail(),
            "first_name": profile.getFirstName(),
            "last_name": profile.getLastName()
        }
    },

    /**
     * Save Subscribe Pro id to Customer Profile
     *
     * @param {dw.customer.Profile} profile Sales Force Commerce Cloud Customer Profile
     */
    setSubproCustomerID: function(profile, subproCustomer) {
        Transaction.wrap(function() {
            profile.custom.subproCustomerID = subproCustomer.id;
        });
    }
}

module.exports = CustomerHelper;