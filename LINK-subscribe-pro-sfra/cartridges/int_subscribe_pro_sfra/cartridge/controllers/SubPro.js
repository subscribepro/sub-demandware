'use strict';

var server = require('server');

var userLoggedIn = require('*/cartridge/scripts/middleware/userLoggedIn');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

var SubscribeProLib = require('*/cartridge/scripts/subpro/lib/SubscribeProLib');

var Logger = require('dw/system/Logger');
var ProductMgr = require('dw/catalog/ProductMgr');

const params = request.httpParameterMap;

server.get('PDP', function (req, res, next) {
    let response = SubscribeProLib.getProduct(params.sku.stringValue);

    var logger = Logger.getLogger('pdp');
    logger.info('test');
    logger.info(JSON.stringify(response))

    if (response.error || !response.result.products.length) {
        return;
    }

    let spproduct = response.result.products.pop();

    // load full product from ProductMgr because the one in the productdetails.isml page
    // loaded by the product factory doesn't have all of the custom properties we need
    let product = ProductMgr.getProduct(params.sku.stringValue)
    if (params.selectedOptionMode.stringValue) {
        spproduct['selected_option_mode'] = params.selectedOptionMode.stringValue;
    } else {
        spproduct['selected_option_mode'] = (spproduct.subscription_option_mode === 'subscription_only' || spproduct.default_subscription_option === 'subscription') ? 'regular' : 'onetime';
    }

    if (params.selectedInterval.stringValue) {
        spproduct['selected_interval'] = params.selectedInterval.stringValue;
    } else {
        spproduct['selected_interval'] = spproduct.default_interval;
    }

    res.render('subpro/product/subprooptions', {
        subproduct: spproduct,
        sfccproduct: product,
        page: 'pdp'
    });
    next();
});

server.get('Cart', function(req, res, next) {
    let cart = app.getModel('Cart').get(),
        pli = cart.getProductLineItemByUUID(params.pliUUID.stringValue);

    if (!pli) {
        return;
    }

    let product = {
        "ID": pli.productID,
        "subscription_option_mode": pli.custom.subproSubscriptionOptionMode,
        "selected_option_mode": pli.custom.subproSubscriptionSelectedOptionMode,
        "selected_interval": pli.custom.subproSubscriptionInterval,
        "intervals": pli.custom.subproSubscriptionAvailableIntervals.split(','),
        "is_discount_percentage": pli.custom.subproSubscriptionIsDiscountPercentage,
        "discount": pli.custom.subproSubscriptionDiscount
    }

    res.render('subpro/product/subprooptions', {
        product: product,
        page: 'cart'
    });
    next();
});

module.exports = server.exports();