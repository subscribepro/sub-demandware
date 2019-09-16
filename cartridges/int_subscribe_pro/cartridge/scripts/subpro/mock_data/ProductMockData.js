var ProductMockData = {
    products: [{
        id: 581356,
        sku: 'test-product',
        name: 'Test Product',
        show_on_ui: true,
        min_qty: 1,
        max_qty: 10,
        price: 250.99,
        discount: 0.2,
        is_discount_percentage: true,
        subscription_option_mode: 'subscription_and_onetime_purchase',
        default_subscription_option: 'onetime_purchase',
        default_interval: 'Monthly',
        intervals: [
            'Every 2 Months',
            'Monthly',
            'Weekly'
        ],
        product_options_mode: 'pass_through',
        shipping_mode: 'requires_shipping',
        is_trial_product: false,
        is_subscription_enabled: true,
        created: '2017-02-23T16:48:44+0000',
        updated: '2017-03-02T21:07:49+0000'
    }],
    pagination: {
        since_id: 0,
        count: 25
    }
};


module.exports = ProductMockData;
