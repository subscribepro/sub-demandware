'use strict';

var Transaction = require('dw/system/Transaction');

var subscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

/**
 * Provides an interface to handle Subscribe Pro address objects and map them to Sales Force Commerce Cloud Customer Address Object.
 */
var AddressHelper = {
    /**
     * Take a Sales Force Commerce Cloud Customer Address Object as a parameter and map any relevant data to Subscribe Pro
     *
     * @param {dw.customer.CustomerAddress} address Sales Force Commerce Cloud Customer Address Object.
     * @param {dw.customer.Profile} profile Sales Force Commerce Cloud Customer profile Object.
     * @param {boolean} includeSPAddressId Whether or not to include the address ID in the return
     * @param {boolean} includeDefaults whether or not to include defaults
     * @return {Object|undefined} an object containing relevant address fields
     */
    getSubproAddress: function (address, profile, includeSPAddressId, includeDefaults) {
        if (!address || !profile) {
            return;
        }

        var subproCustomerID = null;
        var firstName = profile.firstName;
        var lastName = profile.lastName;

        try {
            subproCustomerID = profile.custom.subproCustomerID;
        } catch (e) {
            require('dw/system/Logger').error('Error getting subproCustomerID', e);

            return;
        }

        if (!subproCustomerID || !firstName || !lastName) {
            require('dw/system/Logger').error(
                'Object cannot be created because one of the required parameters is missing: subproCustomerID or firstName or lastName'
            );

            return;
        }

        var payload = {
            customer_id: subproCustomerID,
            first_name: firstName,
            middle_name: '',
            last_name: lastName,
            company: address.companyName || '',
            street1: address.address1 || '',
            street2: address.address2 || '',
            city: address.city || '',
            region: address.stateCode || '',
            postcode: address.postalCode || '',
            country: address.countryCode ? address.countryCode.value.toString().toUpperCase() : '',
            phone: address.phone || ''
        };

        if (includeDefaults) {
            payload.user_defined_fields = {};
            payload.user_defined_fields.is_default_billing = false;
            payload.user_defined_fields.is_default_shipping = false;
        }

        if (includeSPAddressId) {
            try {
                payload.address_id = address.custom.subproAddressID;
            } catch (e) {
                require('dw/system/Logger').error('No Subscribe Pro address ID found', e);
            }
        }

        return payload;
    },

    /**
     * Save Subscribe Pro Address ID to Sales Force Commerce Cloud Customer Address Object
     *
     * @param {dw.customer.CustomerAddress | dw.order.OrderAddress} address Sales Force Commerce Cloud Customer Address Object
     * @param {string} subproAddressID Subscribe Pro Address ID
     */
    setSubproAddressID: function (address, subproAddressID) {
        Transaction.wrap(function () {
            address.custom.subproAddressID = subproAddressID;
        });
    },

    /**
     * Compare if two given addresses are equal
     *
     * @param {dw.customer.AddressBook} address1 first address to compare
     * @param {dw.customer.AddressBook} address2 second address to compare
     * @returns {boolean} if two given addresses are equal
     */
    compareAddresses: function (address1, address2) {
        if (address1 == {} || address2 == {}) {
            return false;
        }
        return (
            address1.address1 === address2.address1 &&
            address1.address2 === address2.address2 &&
            address1.city === address2.city &&
            address1.firstName === address2.firstName &&
            address1.lastName === address2.lastName &&
            address1.phone === address2.phone &&
            address1.postalCode === address2.postalCode
        );
    },

    /**
     * Get customer address which is equal to specified
     *
     * @param {Array} addresses Sales Force Commerce Cloud Customer Address Object
     * @param {dw.customer.CustomerAddress} address Sales Force Commerce Cloud Customer Address Object
     *
     * @returns {dw.customer.CustomerAddress | null} found address or null
     */
    getCustomerAddress: function (addresses, address) {
        for (var i in addresses) {
            var currentAddress = addresses[i];
            var areEqual = this.compareAddresses(currentAddress, address);

            if (areEqual) {
                return currentAddress;
            }
        }

        return null;
    },
    /**
     * Find or create a Address in Subscribe Pro
     * @param {Customer} customer Customer object
     * @param {Address} address Customer's address object
     * @return {int|null} The customer's address ID in Subscribe Pro
     */
    findOrCreateAddress: function (customer, address) {
        var spAddress = this.getSubproAddress(address, customer.profile, false, false);
        var addressResponse = subscribeProLib.findCreateAddress(spAddress);
        this.setSubproAddressID(address, addressResponse.result.address.id);

        return addressResponse.result.address.id;
    }
};

module.exports = AddressHelper;
