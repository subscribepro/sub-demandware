'use strict';

var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var Money = require('dw/value/Money');

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
        var customerID = null;
        var subProCardType = null;

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

        var defaultCustomerAddress = profile.getAddressBook().getPreferredAddress();

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
                country: billingAddress.getCountryCode() ? billingAddress.getCountryCode().toString().toUpperCase() : '',
                phone: billingAddress.phone || ''
            };
        } else if (defaultCustomerAddress) {
            var nameParts = card.creditCardHolder.split(' ');
            var lastName = nameParts.pop();
            var firstName = nameParts.join(' ');
            returnObject.billing_address = {
                last_name: lastName,
                first_name: firstName,
                middle_name: '',
                company: defaultCustomerAddress.companyName || '',
                street1: defaultCustomerAddress.address1,
                street2: defaultCustomerAddress.address2 || '',
                city: defaultCustomerAddress.city,
                region: defaultCustomerAddress.stateCode,
                postcode: defaultCustomerAddress.postalCode,
                country: defaultCustomerAddress.getCountryCode() ? defaultCustomerAddress.getCountryCode().toString().toUpperCase() : '',
                phone: defaultCustomerAddress.phone || ''
            };
        } else {
            var nameParts = card.creditCardHolder.split(' ');
            var lastName = nameParts.pop();
            var firstName = nameParts.join(' ');
            returnObject.billing_address = {
                last_name: lastName,
                first_name: firstName
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
        return (
            instrument1.paymentMethod === instrument2.paymentMethod &&
            instrument1.creditCardNumber === instrument2.creditCardNumber &&
            instrument1.creditCardHolder === instrument2.creditCardHolder &&
            instrument1.creditCardExpirationYear === instrument2.creditCardExpirationYear &&
            instrument1.creditCardExpirationMonth === instrument2.creditCardExpirationMonth
        );
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
        var paymentProfileID =
            customerPaymentInstrument && 'subproPaymentProfileID' in customerPaymentInstrument.custom
                ? customerPaymentInstrument.custom.subproPaymentProfileID
                : false;

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
                paymentProfileID = this.createSubproPaymentProfile(customerProfile, customerPaymentInstrument, billingAddress);

                /**
                 * Some other error occurred, error out
                 */
            } else if (response.error) {
                return null; // eslint-disable-line no-continue
            }
        } else {
            paymentProfileID = this.createSubproPaymentProfile(customerProfile, customerPaymentInstrument, billingAddress);
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
        var response = SubscribeProLib.createPaymentProfile(
            this.getSubscriptionPaymentProfile(customerProfile, paymentInstrument, billingAddress, false)
        );

        if (!response.error) {
            // Payment profile creates successfully. Save Subscribe Pro Payment Profile ID to the Commerce Cloud Order Payment Instrument
            var paymentProfileID = response.result.payment_profile.id;
            this.setSubproPaymentProfileID(paymentInstrument, paymentProfileID);

            return paymentProfileID;
        }

        return null;
    },

    /**
     * Verifies if specified payment instrument already has transactions
     * @param {dw.order.OrderPaymentInstrument} payment - payment details
     * @returns {boolean} returns `true` if transaction exists, returns `false` otherwise
     */
    checkIfHasTransaction: function (payment) {
        var transaction = payment.getPaymentTransaction();
        var hasTransaction = transaction && transaction.getTransactionID() && transaction.getAmount();
        return !!hasTransaction;
    },

    /**
     * Check if Authorized amount bigger than order total
     * @param {dw.order.Order} order - API Order object
     * @param {dw.order.OrderPaymentInstrument} paymentInstrument - API payment instrument object
     * @returns {boolean} - true of false
     */
    doesAuthorizedAmountBiggerOrderTotal: function (order, paymentInstrument) {
        var totalGrossPrice = order.getTotalGrossPrice().getValue();
        var transactionAmount = paymentInstrument.getPaymentTransaction().getAmount().getValue();
        return transactionAmount > totalGrossPrice;
    },

    /**
     * @description Calculates sum of payments in context of specified order
     * @param {dw.order.Order} order specified order
     * @param {boolean} paidOnly determines if only paid transactions should be calculated
     * @returns {dw.value.Money} sum of all payments
     */
    calculatePaymentsAmount: function (order, paidOnly) {
        var currencyCode = order.getCurrencyCode();
        var amountPaid = new Money(0, currencyCode);
        var paymentInstrumentsIterator = order.getPaymentInstruments().iterator();
        while (paymentInstrumentsIterator.hasNext()) {
            var currentPaymentInstrument = paymentInstrumentsIterator.next();
            var paymentTransaction = currentPaymentInstrument.getPaymentTransaction();
            if (paidOnly && !empty(paymentTransaction) && order.getPaymentStatus() === order.PAYMENT_STATUS_PAID) {
                continue;
            }
            if (paymentTransaction) {
                amountPaid = amountPaid.add(paymentTransaction.getAmount());
            }
        }
        return amountPaid;
    },

    /**
     * @description Calculates sum of all payments in context of specified order
     * @param {dw.order.Order} order specified order
     * @returns {dw.value.Money} sum of all payments
     */
    calculateAllPaymentsAmount: function (order) {
        return this.calculatePaymentsAmount(order, false);
    },

    /**
     * @description Calculates sum of only processed payments in context of specified order
     * @param {dw.order.Order} order specified order
     * @returns {dw.value.Money} sum of all processed payments
     */
    calculateProcessedPaymentsAmount: function (order) {
        return this.calculatePaymentsAmount(order, true);
    },

    /**
     * Call service to delete payment profile.
     *
     * @param {string} subproPaymentProfileID Subscribe Pro Payment Profile ID
     */
    deletePaymentProfile: function (subproPaymentProfileID) {
        SubscribeProLib.deletePaymentProfile(subproPaymentProfileID);
    },

    sortByCreationDate: function (arr) {
        // Compare function for sorting based on creation date
        function compareByCreationDate(a, b) {
            // Assuming each object has a 'createdAt' property representing the creation date
            const dateA = new Date(a.lastModified);
            const dateB = new Date(b.lastModified);

            return dateB - dateA;
        }

        // Sort the objects array using the compare function
        arr.sort(compareByCreationDate);

        // Return the sorted array
        return arr;
    }
};

module.exports = PaymentsHelper;
