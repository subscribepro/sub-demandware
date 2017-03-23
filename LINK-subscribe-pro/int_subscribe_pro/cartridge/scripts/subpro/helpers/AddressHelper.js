'use strict';

const Transaction = require('dw/system/Transaction');

/**
 * Provides an interface to handle Subscribe Pro address objects and map them to Sales Force Commerce Cloud Customer Address Object.
 */
let AddressHelper = {

    /**
     * Take a Sales Force Commerce Cloud Customer Address Object as a parameter and map any relevant data to Subscribe Pro
     *
     * @param {dw.customer.CustomerAddress} address Sales Force Commerce Cloud Customer Address Object.
     * @param {dw.customer.Profile} profile Sales Force Commerce Cloud Customer profile Object.
     *
     * @return Object an object containing relevant address fields
     */
    getSubproAddress: function(address, profile) {
        if (!address || !profile) {
            return;
        }

        let subproCustomerID,
            firstName = profile.getFirstName(),
            lastName = profile.getLastName();

        try {
            subproCustomerID = profile.custom.subproCustomerID;
        } catch (e) {
            require('dw/system/Logger').error('Error getting subproCustomerID', e);

            return;
        }

        if (!subproCustomerID || !firstName || !lastName) {
            require('dw/system/Logger').error('Object cannot be created because one of the required parameters is missing: subproCustomerID or firstName or lastName');

            return;
        }

        return {
            "customer_id": subproCustomerID,
            "first_name": firstName,
            "last_name": lastName,
            "company": address.getCompanyName() || "",
            "street1": address.getAddress1() || "",
            "street2": address.getAddress2() || "",
            "city": address.getCity() || "",
            "postcode": address.getPostalCode() || "",
            "country": address.getCountryCode().toString() || "",
            "phone": address.getPhone() || ""
        }
    },

    /**
     * Save Subscribe Pro Address ID to CustomerAddress
     *
     * @param {dw.customer.CustomerAddress} customerAddress Sales Force Commerce Cloud Customer Address Object
     * @param {String} subproAddressID Subscribe Pro Address ID
     */
    setSubproAddressID: function(customerAddress, subproAddressID) {
        Transaction.wrap(function() {
            customerAddress.custom.subproAddressID = subproAddressID;
        });
    }
}

module.exports = AddressHelper;