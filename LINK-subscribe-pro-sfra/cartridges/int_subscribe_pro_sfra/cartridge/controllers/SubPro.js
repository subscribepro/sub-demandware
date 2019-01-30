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

    if (response.error || !response.result.products.length) {
        return;
    }

    let spproduct = response.result.products.pop();

    // load full product from ProductMgr because the one in the productdetails.isml page
    // loaded by the product factory doesn't have all of the custom properties we need
    let product = ProductMgr.getProduct(params.sku.stringValue);
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
    let basketMgr = require('dw/order/BasketMgr');
    let basket = basketMgr.getCurrentBasket();
    let pli = basket.getProductLineItems(params.sku.stringValue).pop();

    if (!pli) {
        return;
    }

    let response = SubscribeProLib.getProduct(params.sku.stringValue);
    if (response.error || !response.result.products.length) {
        return;
    }

    let spproduct = response.result.products.pop();
    let sfccProduct = ProductMgr.getProduct(params.sku.stringValue);

    let product = {
        "ID": pli.getProductID(),
        "subscription_option_mode": sfccProduct.custom.subproSubscriptionOptionMode,
        "selected_option_mode": sfccProduct.custom.subproSubscriptionSelectedOptionMode,
        "selected_interval": sfccProduct.custom.subproSubscriptionInterval,
        "intervals": null !== sfccProduct.custom.subproSubscriptionAvailableIntervals ? pli.custom.subproSubscriptionAvailableIntervals.split(',') : [],
        "is_discount_percentage": sfccProduct.custom.subproSubscriptionIsDiscountPercentage,
        "discount": sfccProduct.custom.subproSubscriptionDiscount
    }



    res.render('subpro/product/subprooptions', {
        product: product,
        sfccproduct: sfccProduct,
        page: 'cart'
    });
    next();
});

server.get('OrderSummary', function (req, res, next) {
    let cart = app.getModel('Cart').get(),
        pli = cart.getProductLineItemByUUID(params.pliUUID.stringValue);

    if (!pli) {
        return;
    }

    let product = {
        "selected_option_mode": pli.custom.subproSubscriptionSelectedOptionMode,
        "selected_interval": pli.custom.subproSubscriptionInterval
    };

    res.render('subpro/order/subprooptions', {
        product: product,
        page: 'order-summary'
    });
    next();
});

server.get('OrderConfirmation', function (req, res, next) {
    let order = require('dw/order/OrderMgr').getOrder(params.orderNo.stringValue),
        productID = params.productID.stringValue;

    if (!order) {
        return;
    }

    let shipments = order.shipments;
    for (let i = 0, sl = shipments.length; i < sl; i++) {
        let plis = shipments[i].productLineItems;
        for (let j = 0, pl = plis.length; j < pl; j++) {
            let pli = plis[j];
            if (pli.productID === productID) {
                let product = {
                    "selected_option_mode": pli.custom.subproSubscriptionSelectedOptionMode,
                    "selected_interval": pli.custom.subproSubscriptionInterval
                };

                res.render('subpro/order/subprooptions', {
                    product: product,
                    page: 'order-confirmation'
                });
            }
        }
    }
    next();
});

server.post('UpdateOptions', function (res, req, next) {
    let options = JSON.parse(params.options),
        cart = app.getModel('Cart').get(),
        pli = cart.getProductLineItemByUUID(options.pliUUID);

    if (!pli) {
        return;
    }

    require('dw/system/Transaction').wrap(function () {
        pli.custom.subproSubscriptionSelectedOptionMode = options.subscriptionMode;
        pli.custom.subproSubscriptionInterval = options.deliveryInteval;

        let discountValue = parseFloat(options.discount),
            discountToApply = (options.isDiscountPercentage === 'true' || options.isDiscountPercentage === true)
                ? new dw.campaign.PercentageDiscount(discountValue * 100)
                : new dw.campaign.AmountDiscount(discountValue);

        /**
         * Remove previous 'SubscribeProDiscount' adjustments if any
         */
        let priceAdjustment = pli.getPriceAdjustmentByPromotionID('SubscribeProDiscount');
        pli.removePriceAdjustment(priceAdjustment);

        if (options.subscriptionMode === 'regular') {
            pli.createPriceAdjustment('SubscribeProDiscount', discountToApply);
        }
    });
    next();
});


module.exports = server.exports();