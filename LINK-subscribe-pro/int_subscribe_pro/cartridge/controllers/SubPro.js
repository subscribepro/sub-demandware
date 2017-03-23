'use strict';

/**
 * Controller that handles product subscription options
 *
 * @module controllers/SubPro
 */

const params = request.httpParameterMap;

/* Script Modules */
const app = require('/app_storefront_controllers/cartridge/scripts/app');
const guard = require('/app_storefront_controllers/cartridge/scripts/guard');
const ISML = require('dw/template/ISML');
const SubscribeProLib = require('~/cartridge/scripts/subpro/lib/SubscribeProLib.js');

/**
 * Renders product subscription options on PDP.
 *
 * Gets product SKU from the httpParameterMap.
 */
function productSubscriptionsPDP() {
    let response = SubscribeProLib.getProduct(params.sku.stringValue);

    if (response.error || !response.result.products.length) {
        return;
    }

    let product = response.result.products.pop();

    ISML.renderTemplate('subpro/product/subprooptions', {
        product: product,
        page: 'pdp'
    });
}

/**
 * Renders product subscription options on Cart Summary.
 *
 * Gets ProductLineItem UUID as a parameter from the httpParameterMap
 */
function productSubscriptionsCart() {
    let cart = app.getModel('Cart').get(),
        pli = cart.getProductLineItemByUUID(params.pliUUID.stringValue);

    if (!pli) {
        return;
    }

    let product = {
        "subscription_option_mode": pli.custom.subproSubscriptionOptionMode,
        "selected_option_mode": pli.custom.subproSubscriptionSelectedOptionMode,
        "selected_interval": pli.custom.subproSubscriptionInterval,
        "intervals": pli.custom.subproSubscriptionAvailableIntervals.split(','),
        "is_discount_percentage": pli.custom.subproSubscriptionIsDiscountPercentage,
        "discount": pli.custom.subproSubscriptionDiscount
    }

    ISML.renderTemplate('subpro/product/subprooptions', {
        product: product,
        page: 'cart'
    });
}

/**
 * Renders product subscription options on Order Summary Page.
 *
 * Gets ProductLineItem UUID as a parameter from the httpParameterMap
 */
function productSubscriptionsOrderSummary() {
    let cart = app.getModel('Cart').get(),
        pli = cart.getProductLineItemByUUID(params.pliUUID.stringValue);

    if (!pli) {
        return;
    }

    let product = {
        "selected_option_mode": pli.custom.subproSubscriptionSelectedOptionMode,
        "selected_interval": pli.custom.subproSubscriptionInterval
    }

    ISML.renderTemplate('subpro/order/subprooptions', {
        product: product,
        page: 'order-summary'
    });
}

/**
 * Renders product subscription options on Order Confirmation Page.
 *
 * Gets orderNo and product ID as a parameter from the httpParameterMap
 */
function productSubscriptionsOrderConfirmation() {
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
                }

                ISML.renderTemplate('subpro/order/subprooptions', {
                    product: product,
                    page: 'order-confirmation'
                });
            }
        }
    }
}

/**
 * Updates Subscription Options such as subproSubscriptionOptionMode and subproSubscriptionInterval on Product Line Item.
 *
 * @transactional
 */
function updateSubscriptionOptions() {
    let options = JSON.parse(params.options),
        cart = app.getModel('Cart').get(),
        pli = cart.getProductLineItemByUUID(options.pliUUID);

    if (!pli) {
        return;
    }

    require('dw/system/Transaction').wrap(function() {
        pli.custom.subproSubscriptionSelectedOptionMode = options.subscriptionMode;
        pli.custom.subproSubscriptionInterval = options.deliveryInteval;
    });
}

/*
 * Web exposed methods
 */
/**
 * Renders template with subscription options for product.
 * @see module:controllers/SubPro~productSubscriptionsPDP
 */
exports.PDP = guard.ensure(['get'], productSubscriptionsPDP);

/**
 * Renders template with subscription options for productLineItem.
 * @see module:controllers/SubPro~productSubscriptionsCart
 */
exports.Cart = guard.ensure(['get'], productSubscriptionsCart);

/**
 * Renders template with subscription options for productLineItem on order summary page.
 * @see module:controllers/SubPro~productSubscriptionsOrderSummary
 */
exports.OrderSummary = guard.ensure(['get'], productSubscriptionsOrderSummary);

/**
 * Renders product subscription options on Order Confirmation Page.
 * @see module:controllers/SubPro~productSubscriptionsOrderConfirmation
 */
exports.OrderConfirmation = guard.ensure(['get'], productSubscriptionsOrderConfirmation);

/**
 * Updates Subscription Options on productLineItem.
 * @see module:controllers/SubPro~updateSubscriptionOptions
 */
exports.UpdateOptions = guard.ensure(['post'], updateSubscriptionOptions);