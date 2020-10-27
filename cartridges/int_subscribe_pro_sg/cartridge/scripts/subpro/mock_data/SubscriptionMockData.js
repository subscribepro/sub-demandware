var SubscriptionMockData = {
    subscription: {
        id: 588763,
        customer_id: '761431',
        status: 'Active',
        product_sku: 'test-product',
        qty: 1,
        use_fixed_price: false,
        interval: 'Every 2 Months',
        next_order_date: '2017-04-23',
        created_as_trial: false,
        requires_shipping: true,
        payment_profile: {
            id: 1041328,
            customer_id: '761431',
            magento_customer_id: '1',
            customer_email: 'test@mail.com',
            customer_facing_name: 'Visa ending in 1111',
            merchant_facing_name: 'Visa ending in 1111',
            profile_type: 'spreedly_vault',
            payment_method_type: 'credit_card',
            status: 'retained',
            payment_vault: 'Subscribe Pro Sandbox',
            gateway: 'Subscribe Pro Sandbox',
            payment_token: 'KbNDZlGSc6HL37KasBTl534QjtF',
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
            id: 1160728,
            customer_id: '761431',
            first_name: 'Test',
            last_name: 'User',
            created: '2017-03-15T17:41:32+0000',
            updated: '2017-03-15T17:41:32+0000'
        },
        recurring_order_count: 0,
        failed_order_attempt_count: 0,
        creditcard_last_digits: '1111',
        subscription_products: [{
            product_sku: 'test-product',
            qty: 1,
            created: '2017-03-15T17:41:32+0000',
            updated: '2017-03-15T17:41:32+0000'
        }],
        user_defined_fields: [],
        created: '2017-03-15T17:41:32+0000',
        updated: '2017-03-15T17:41:32+0000'
    }
};

module.exports = SubscriptionMockData;
