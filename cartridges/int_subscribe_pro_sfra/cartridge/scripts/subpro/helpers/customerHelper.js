'use strict';

var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

/**
 * Provides an interface to handle Subscribe Pro customer objects and map them to Sales Force Commerce Cloud Customer Object.
 */
var CustomerHelper = {

    /**
     * Take a Sales Force Commerce Cloud Customer Object as a parameter and map any relevant data to Subscribe Pro
     *
     * @param {dw.customer.Customer} customer Sales Force Commerce Cloud Customer Object.
     *
     * @return {Object} an object containing relevant customer fields
     */
    getSubproCustomer: function (customer) {
        var profile = customer.getProfile();

        return {
            email: profile.email,
            first_name: profile.firstName,
            last_name: profile.lastName,
            platform_specific_customer_id: profile.customerNo
        };
    },

    /**
     * Find or create a customer in Subscribe Pro
     * @param {Customer} customer Customer object
     * @return {int|null} The customer ID in Subscribe Pro
     */
    findOrCreateCustomer: function (customer) {
        var customerSubproID = customer.profile.custom.subproCustomerID;

        /**
         * Customer is already a Subscribe Pro Customer
         * Call service to verify that they are still a customer
         */
        if (customerSubproID) {
            var getCustomerResponse = SubscribeProLib.getCustomer(customerSubproID);

            if (getCustomerResponse.error && getCustomerResponse.result.code === 404) {
                // Customer not found. Create new customer record
                customerSubproID = CustomerHelper.createSubproCustomer(customer);
            } else if (getCustomerResponse.error) {
                return null;
            }
        } else {
            customerSubproID = CustomerHelper.createSubproCustomer(customer);
        }

        return customerSubproID;
    },

    /**
     * Call service to create customer.
     *
     * @param {dw.customer.Customer} customer Sales Force Commerce Cloud Customer Object
     * @return {number|undefined} id unique identifier of created customer or undefined
     */
    createSubproCustomer: function (customer) {
        var customerToPost = CustomerHelper.getSubproCustomer(customer);
        var createCustomerResponse = SubscribeProLib.createCustomer(customerToPost);

        if (!createCustomerResponse.error) {
            // Customer creates successfully. Save Subscribe Pro Customer ID to the Commerce Cloud Customer Profile
            CustomerHelper.setSubproCustomerID(customer.profile, createCustomerResponse.result.customer.id);

            return createCustomerResponse.result.customer.id;
        } if (createCustomerResponse.error && createCustomerResponse.result.code === 409) {
            // Customer's email address already exists, get customer by email
            createCustomerResponse = SubscribeProLib.getCustomer(null, customerToPost.email);
            if (!createCustomerResponse.error) {
                var customerID = createCustomerResponse.result.customers.pop().id;
                CustomerHelper.setSubproCustomerID(customer.profile, customerID);

                return customerID;
            }
        }

        return null;
    },

    updateCustomerInPlatform: function (spCustomerId, customerData) {
        SubscribeProLib.updateCustomer(spCustomerId, customerData);
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
