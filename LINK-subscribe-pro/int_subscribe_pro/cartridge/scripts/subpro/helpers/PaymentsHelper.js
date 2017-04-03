'use strict';

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
     * @returns Object SubPro payment profile object with relevant fields
     */
    setSubscriptionPaymentProfile: function(profile, card, billingAddress) {
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
    }
}

module.exports = PaymentsHelper;