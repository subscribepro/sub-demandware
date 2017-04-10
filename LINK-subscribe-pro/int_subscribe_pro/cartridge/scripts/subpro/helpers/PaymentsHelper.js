'use strict';

const Transaction = require('dw/system/Transaction');
const Logger = require('dw/system/Logger');

/**
 * Provides an interface to handle Subscribe Pro payment objects.
 */
let PaymentsHelper = {

    /**
     * Maps data from order to payment profile object which will be send to SubPro
     *
     * @param {dw.customer.Profile} profile Sales Force Commerce Cloud Customer profile Object
     * @param {dw.order.OrderPaymentInstrument} card payment instrument used to pay order
     * @param {dw.order.OrderAddress} billingAddress The Address class represents a customer's address
     *
     * @returns Object|undefined SubPro payment profile object with relevant fields or undefined
     */
    getSubscriptionPaymentProfile: function (profile, card, billingAddress) {
        let customerID;

        try {
            customerID = profile.custom.subproCustomerID;
        } catch (e) {
            require('dw/system/Logger').error('Error getting subproCustomerID', e);
            return;
        }

        return {
            "customer_id": customerID,
            "payment_token": card.creditCardToken,
            "creditcard_type": card.creditCardType,
            "creditcard_first_digits": card.creditCardNumber.substr(0, 5),
            "creditcard_last_digits": card.creditCardNumberLastDigits,
            "creditcard_month": card.creditCardExpirationMonth,
            "creditcard_year": card.creditCardExpirationYear,
            "vault_specific_fields": {
                "sfcc": {
                    "payment_instrument_id": card.UUID
                }
            },
            "billing_address": {
                "first_name": billingAddress.firstName,
                "middle_name": "",
                "last_name": billingAddress.lastName,
                "company": billingAddress.companyName || "",
                "street1": billingAddress.address1,
                "street2": billingAddress.address2 || "",
                "city": billingAddress.city,
                "region": billingAddress.stateCode,
                "postcode": billingAddress.postalCode,
                "country": billingAddress.countryCode.toString(),
                "phone": billingAddress.phone || ""
            }
        }
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
        return instrument1.paymentMethod === instrument2.paymentMethod &&
            instrument1.creditCardNumber === instrument2.creditCardNumber &&
            instrument1.creditCardHolder === instrument2.creditCardHolder &&
            instrument1.creditCardExpirationYear === instrument2.creditCardExpirationYear &&
            instrument1.creditCardExpirationMonth === instrument2.creditCardExpirationMonth;
    },

    /**
     * Get customer payment instrument  which is equal to specified
     *
     * @param {dw.customer.CustomerPaymentInstrument} customerPaymentInstruments Sales Force Commerce Cloud Customer Payment Instrument
     * @param {dw.order.PaymentInstrument} paymentInstrument Sales Force Commerce Cloud Payment Instrument
     *
     * @returns {dw.customer.CustomerPaymentInstrument | null } found payment instrument or null
     */
    getCustomerPaymentInstrument: function (customerPaymentInstruments, paymentInstrument) {
        let paymentInstruments = customerPaymentInstruments.iterator();
        while (paymentInstruments.hasNext()) {
            let currentInstrument = paymentInstruments.next(),
                areEqual = this.comparePaymentInstruments(currentInstrument, paymentInstrument);

            if (areEqual) {
                return currentInstrument;
            }
        }

        return null;
    }
};

module.exports = PaymentsHelper;