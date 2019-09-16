var SubscriptionsMockData = {
    subscriptions: [
        {
            id: 548029,
            customer_id: '761431',
            status: 'Active',
            product_sku: 'test-product',
            qty: 1,
            use_fixed_price: false,
            interval: 'Every 2 Months',
            next_order_date: '2017-04-23',
            created_as_trial: false,
            magento_store_code: 'default',
            requires_shipping: true,
            magento_shipping_method_code: 'flatrate_flatrate',
            payment_profile: {
                id: 1041328,
                customer_id: '761431',
                magento_customer_id: '1',
                customer_email: 'david.king@subscribepro.com',
                customer_facing_name: 'Visa ending in 1111',
                merchant_facing_name: 'Visa ending in 1111',
                profile_type: 'spreedly_vault',
                payment_method_type: 'credit_card',
                status: 'retained',
                payment_vault: 'Subscribe Pro Sandbox',
                gateway: 'Subscribe Pro Sandbox',
                payment_token: 'XXXXXXXXXXXXXXXXX',
                creditcard_type: 'visa',
                creditcard_last_digits: '1111',
                creditcard_month: '12',
                creditcard_year: '2027',
                creditcard_first_digits: '411111',
                created: '2017-02-23T16:48:42+0000',
                updated: '2017-02-23T16:48:42+0000',
                billing_address: {
                    id: 1116880,
                    customer_id: '761431',
                    first_name: 'Test',
                    last_name: 'User',
                    street1: 'Test Address',
                    city: 'Baltimore',
                    region: 'MD',
                    postcode: '21224',
                    country: 'US',
                    phone: '1111111111',
                    created: '2017-02-23T16:48:42+0000',
                    updated: '2017-02-23T16:48:42+0000'
                }
            },
            shipping_address: {
                id: 1116883,
                customer_id: '761431',
                magento_address_id: 1,
                first_name: 'Test',
                last_name: 'User',
                created: '2017-02-23T16:48:44+0000',
                updated: '2017-02-23T16:48:44+0000'
            },
            failed_order_attempt_count: 0,
            creditcard_last_digits: '1111',
            subscription_products: [
                {
                    product_sku: 'test-product',
                    qty: '1',
                    created: '2017-02-23T16:48:45+0000',
                    updated: '2017-02-23T16:48:45+0000'
                }
            ],
            magento_shipping_address_id: 1,
            user_defined_fields: [

            ],
            created: '2017-02-23T16:48:45+0000',
            updated: '2017-02-23T16:48:45+0000',
            recurring_order_count: 0
        }
    ],
    pagination: {
        since_id: 0,
        count: 25
    }
};


module.exports = SubscriptionsMockData;
