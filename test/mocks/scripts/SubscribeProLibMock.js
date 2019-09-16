var customerMockData = require('./CustomerMockData');
var paymentsMockData = require('./PaymentProfileMockData');

var SubscribeProLib = {
    getCustomer: function (customerId) {
        if (customerId == 12345) {
            return customerMockData.spCustomer;
        }
        return null;
    },
    createCustomer: function (customer) {
        return {
            error: false,
            result: {
                customer: {
                    id: customerMockData.spCustomerWithId.id
                }
            }
        };
    },
    getPaymentProfile: function (paymentProfile) {
        return {
            error: false,
            result: {
                payment_profile: {
                    id: paymentsMockData.spPaymentProfile.payment_profile_id
                }
            }
        };
    },
    createPaymentProfile: function () {
        return {
            error: false,
            result: {
                payment_profile: {
                    id: paymentsMockData.spPaymentProfile.payment_profile_id
                }
            }
        };
    },
    getToken: function (customerID, grantType, scope) {
        return {
            error: false,
            result: {
                access_token: 'abcde12345',
                spreedly_environment_key: 'DUMMY_KEY',
                customer_id: customerID
            }
        };
    }
};
module.exports = SubscribeProLib;
