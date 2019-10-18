'use strict';

var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

/**
 * Provides an interface to handle Subscribe Pro payment objects.
 */
var PaymentsHelper = {

    /**
     * Maps data from order to payment profile object which will be send to SubPro
     *
     * @param {dw.customer.Profile} profile Sales Force Commerce Cloud Customer profile Object
     * @param {dw.order.OrderPaymentInstrument} card payment instrument used to pay order
     * @param {dw.order.OrderAddress} billingAddress The Address class represents a customer's address
     * @param {boolean} includeSpId Whether or not to include the Subscribe Pro Payment Profile ID
     *
     * @returns {Object|undefined} SubPro payment profile object with relevant fields or undefined
     */
    getSubscriptionPaymentProfile: function (profile, card, billingAddress, includeSpId) {
        var customerID; var
            subProCardType;

        /**
         * Try to get the Customer Subscribe Pro ID
         */
        try {
            customerID = profile.custom.subproCustomerID;
        } catch (e) {
            Logger.error('Error getting subproCustomerID', e);
            return;
        }

        /**
         * Try to get the Subscribe Pro Card Type
         */
        try {
            var PaymentMgr = require('dw/order/PaymentMgr');
            var paymentCard = PaymentMgr.getPaymentCard(card.creditCardType);
            subProCardType = paymentCard.custom.subproCardType;
        } catch (e) {
            Logger.error('Unable to retreieve the Subscribe Pro Card type', e);
            return;
        }

        var returnObject = {
            customer_id: customerID,
            payment_token: card.UUID,
            creditcard_type: subProCardType,
            creditcard_last_digits: card.creditCardNumberLastDigits,
            creditcard_month: card.creditCardExpirationMonth,
            creditcard_year: card.creditCardExpirationYear,
            vault_specific_fields: {
                sfcc: {
                    payment_instrument_id: card.UUID
                }
            }
        };

        if (includeSpId) {
            returnObject.payment_profile_id = card.custom.subproPaymentProfileID;
        }

        if (typeof billingAddress.getCountryCode === 'function') {
            returnObject.billing_address = {
                first_name: billingAddress.firstName,
                middle_name: '',
                last_name: billingAddress.lastName,
                company: billingAddress.companyName || '',
                street1: billingAddress.address1,
                street2: billingAddress.address2 || '',
                city: billingAddress.city,
                region: billingAddress.stateCode,
                postcode: billingAddress.postalCode,
                country: (billingAddress.getCountryCode() ? billingAddress.getCountryCode().toString().toUpperCase() : ''),
                phone: billingAddress.phone || ''
            };
        } else {
            var nameParts = card.creditCardHolder.split(' ');
            var lastName = nameParts.pop();
            var firstName = nameParts.join(' ');
            returnObject.billing_address = {
                first_name: firstName,
                last_name: lastName
            };
        }

        return returnObject;
    },

    /**
     * Save Subscribe Pro payment profile id to Customer Payment Instrument
     *
     * @param {dw.customer.CustomerPaymentInstrument} paymentInstrument payment instrument to update
     * @param {string} paymentProfileID Subscribe Pro Payment Profile ID
     */
    setSubproPaymentProfileID: function (paymentInstrument, paymentProfileID) {
        try {
            Transaction.wrap(function () {
                paymentInstrument.custom.subproPaymentProfileID = paymentProfileID;
            });
        } catch (e) {
            Logger.error("Error while updating order's payment instrument subproPaymentProfileID attribute", e);
        }
    },

    /**
     * Compare if two given payment instruments are equal
     *
     * @param {dw.order.PaymentInstrument} instrument1 first payment instrument to compare
     * @param {dw.order.PaymentInstrument} instrument2 second payment instrument to compare
     *
     * @returns {boolean} if two given payment instruments are equal
     */
    comparePaymentInstruments: function (instrument1, instrument2) {
        return instrument1.paymentMethod === instrument2.paymentMethod
            && instrument1.creditCardNumber === instrument2.creditCardNumber
            && instrument1.creditCardHolder === instrument2.creditCardHolder
            && instrument1.creditCardExpirationYear === instrument2.creditCardExpirationYear
            && instrument1.creditCardExpirationMonth === instrument2.creditCardExpirationMonth;
    },

    /**
     * Get customer payment instrument  which is equal to specified
     *
     * @param {Array} customerPaymentInstruments Sales Force Commerce Cloud Customer Payment Instruments
     * @param {dw.order.PaymentInstrument} paymentInstrument Sales Force Commerce Cloud Payment Instrument
     *
     * @returns {dw.customer.CustomerPaymentInstrument | null } found payment instrument or null
     */
    getCustomerPaymentInstrument: function (customerPaymentInstruments, paymentInstrument) {
        for (var i in customerPaymentInstruments) {
            var currentInstrument = customerPaymentInstruments[i];
            var areEqual = this.comparePaymentInstruments(currentInstrument, paymentInstrument);

            if (areEqual) {
                return currentInstrument;
            }
        }

        return null;
    },

    /**
     * Find or create a payment profile
     * @param {OrderPaymentInstrument} paymentInstrument Payment instrument from the order
     * @param {CustomerPaymentInstrument} customerPaymentInstrument Customer payment instrument object
     * @param {Profile} customerProfile Customer Profile object
     * @param {Object} billingAddress Billing address object
     * @return {int|null} Payment profile ID
     */
    findOrCreatePaymentProfile: function (paymentInstrument, customerPaymentInstrument, customerProfile, billingAddress) {
        var paymentProfileID = (
            customerPaymentInstrument
            && ('subproPaymentProfileID' in customerPaymentInstrument.custom)
        ) ? customerPaymentInstrument.custom.subproPaymentProfileID : false;

        /**
         * If Payment Profile already exists,
         * Call service to verify that it still exists at Subscribe Pro
         */
        if (paymentProfileID) {
            var response = SubscribeProLib.getPaymentProfile(paymentProfileID);

            /**
             * Payment Profile not found, create new Payment Profile record
             * Otherwise create the payment profile
             */
            if (response.error && response.result.code === 404) {
                paymentProfileID = PaymentsHelper.createSubproPaymentProfile(customerProfile, customerPaymentInstrument, billingAddress);
            /**
             * Some other error occurred, error out
             */
            } else if (response.error) {
                return null; // eslint-disable-line no-continue
            }
        } else {
            paymentProfileID = PaymentsHelper.createSubproPaymentProfile(customerProfile, customerPaymentInstrument, billingAddress);
        }

        return paymentProfileID;
    },

    /**
     * Call service to create payment profile.
     *
     * @param {dw.customer.Profile} customerProfile Sales Force Commerce Cloud Customer profile Object
     * @param {dw.customer.CustomerPaymentInstrument} paymentInstrument payment instrument used to pay order
     * @param {dw.order.OrderAddress} billingAddress the Address class represents a customer's address
     * @return {number|undefined} id unique identifier of created payment profile or undefined
     */
    createSubproPaymentProfile: function (customerProfile, paymentInstrument, billingAddress) {
        var response = SubscribeProLib.createPaymentProfile(PaymentsHelper.getSubscriptionPaymentProfile(customerProfile, paymentInstrument, billingAddress, false));

        if (!response.error) {
            // Payment profile creates successfully. Save Subscribe Pro Payment Profile ID to the Commerce Cloud Order Payment Instrument
            var paymentProfileID = response.result.payment_profile.id;
            PaymentsHelper.setSubproPaymentProfileID(paymentInstrument, paymentProfileID);

            return paymentProfileID;
        }

        return null;
    }
};

module.exports = PaymentsHelper;
