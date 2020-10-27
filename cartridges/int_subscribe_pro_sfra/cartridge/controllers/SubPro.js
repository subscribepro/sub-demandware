'use strict';

var server = require('server');
var SubscribeProLib = require('/int_subscribe_pro_sfra/cartridge/scripts/subpro/lib/subscribeProLib');
var ProductMgr = require('dw/catalog/ProductMgr');
var URLUtils = require('dw/web/URLUtils');
var BasketMgr = require('dw/order/BasketMgr');
var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');

var params = request.httpParameterMap;

server.get('PDP', function (req, res, next) {
    if (subproEnabled) {
        var response = SubscribeProLib.getProduct(params.sku.stringValue);

        if (response.error || !response.result.products.length) {
            return;
        }

        var spproduct = response.result.products.pop();

        // load full product from ProductMgr because the one in the productdetails.isml page
        // loaded by the product factory doesn't have all of the custom properties we need
        var product = ProductMgr.getProduct(params.sku.stringValue);
        if (params.selectedOptionMode.stringValue) {
            spproduct.selected_option_mode = params.selectedOptionMode.stringValue;
        } else {
            spproduct.selected_option_mode = (spproduct.subscription_option_mode === 'subscription_only' || spproduct.default_subscription_option === 'subscription') ? 'regular' : 'onetime';
        }

        selectedInterval = params.selectedInterval.stringValue || null;

        var schedulingHelper = require('/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/schedulingHelper.js');
        var productSchedule = schedulingHelper.getAvailableScheduleData(spproduct, selectedInterval);

        res.render('subpro/product/subprooptions', {
            subproduct: spproduct,
            productSchedule: productSchedule,
            sfccproduct: product,
            subprooptionsurl: URLUtils.url('SubPro-UpdateOptions').toString(),
            page: 'pdp'
        });
    }
    next();
});

server.get('Cart', function (req, res, next) {
    if (subproEnabled) {
        var basket = BasketMgr.getCurrentOrNewBasket();
        var pli = basket.getAllProductLineItems(params.sku.stringValue).pop();

        if (!pli) {
            return;
        }

        var response = SubscribeProLib.getProduct(params.sku.stringValue);
        if (response.error || !response.result.products.length) {
            return;
        }

        var spproduct = response.result.products.pop();
        var sfccProduct = ProductMgr.getProduct(params.sku.stringValue);

        selectedInterval = pli.custom.subproSubscriptionInterval || null;

        var schedulingHelper = require('/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/schedulingHelper.js');
        var productSchedule = schedulingHelper.getAvailableScheduleData(spproduct, selectedInterval);
        pliScheduleData = schedulingHelper.getScheduleParamsFromPli(pli, schedulingHelper.getProductScheduleType(spproduct));
        for (var i in pliScheduleData) {
            productSchedule[i] = pliScheduleData[i];
        }

        var productData = {
            ID: pli.getProductID(),
            subscription_option_mode: spproduct.subscription_option_mode,
            selected_option_mode: pli.custom.subproSubscriptionSelectedOptionMode,
            is_discount_percentage: pli.custom.subproSubscriptionIsDiscountPercentage,
            discount: pli.custom.subproSubscriptionDiscount
        };
        res.render('subpro/product/subprooptions', {
            subproduct: productData,
            productSchedule: productSchedule,
            sfccproduct: sfccProduct,
            subprooptionsurl: URLUtils.url('SubPro-UpdateOptions').toString(),
            page: 'cart'
        });
    }
    next();
});

server.get('OrderSummary', function (req, res, next) {
    if (subproEnabled) {
        var basket = BasketMgr.getCurrentOrNewBasket();
        var pli = basket.getAllProductLineItems(params.sku.stringValue).pop();

        if (!pli) {
            return;
        }

        var product = {
            selected_option_mode: pli.custom.subproSubscriptionSelectedOptionMode,
            selected_interval: pli.custom.subproSubscriptionInterval
        };
        var response = SubscribeProLib.getProduct(params.sku.stringValue);
        if (response.error || !response.result.products.length) {
            return;
        }
        var spproduct = response.result.products.pop();
        var schedulingHelper = require('/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/schedulingHelper.js');
        var productSchedule = schedulingHelper.getAvailableScheduleData(spproduct, product.selected_interval);
        pliScheduleData = schedulingHelper.getScheduleParamsFromPli(pli, schedulingHelper.getProductScheduleType(spproduct));
        for (var i in pliScheduleData) {
            productSchedule[i] = pliScheduleData[i];
        }

        res.render('subpro/cart/subprooptions', {
            product: product,
            productSchedule: productSchedule,
            page: 'order-summary'
        });
    }
    next();
});

server.get('OrderConfirmation', function (req, res, next) {
    if (subproEnabled) {
        var order = require('dw/order/OrderMgr').getOrder(params.orderNumber.stringValue);
        var productID = params.sku.stringValue;

        if (!order) {
            return;
        }

        var shipments = order.shipments;
        for (var i = 0, sl = shipments.length; i < sl; i++) {
            var plis = shipments[i].productLineItems;
            for (var j = 0, pl = plis.length; j < pl; j++) {
                var pli = plis[j];
                if (pli.productID === productID) {
                    var product = {
                        selected_option_mode: pli.custom.subproSubscriptionSelectedOptionMode,
                        selected_interval: pli.custom.subproSubscriptionInterval
                    };
                    var response = SubscribeProLib.getProduct(params.sku.stringValue);
                    if (response.error || !response.result.products.length) {
                        return;
                    }
                    var spproduct = response.result.products.pop();
                    var schedulingHelper = require('/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/schedulingHelper.js');
                    var productSchedule = schedulingHelper.getAvailableScheduleData(spproduct, product.selected_interval);
                    pliScheduleData = schedulingHelper.getScheduleParamsFromPli(pli, schedulingHelper.getProductScheduleType(spproduct));
                    for (var k in pliScheduleData) {
                        productSchedule[k] = pliScheduleData[k];
                    }

                    res.render('subpro/cart/subprooptions', {
                        product: product,
                        productSchedule: productSchedule,
                        page: 'order-confirmation'
                    });
                }
            }
        }
    }
    next();
});

server.post('UpdateOptions', function (req, res, next) {
    if (subproEnabled) {
        var basket = BasketMgr.getCurrentOrNewBasket();
        var CartModel = require('*/cartridge/models/cart');
        var pli = basket.getAllProductLineItems(req.querystring.pliUUID).pop();

        if (!pli || pli == 'null' || pli == 'undefined') {
            res.json({ success: 'false', errorMessage: 'pli is undefined' });
            return next();
        }

        var product = pli.getProduct();
        var Logger = require('dw/system/Logger');
        if (!product.custom.subproSubscriptionEnabled) {
            return next();
        }

        require('dw/system/Transaction').wrap(function () {
            pli.custom.subproSubscriptionSelectedOptionMode = params.subscriptionMode;
            pli.custom.subproSubscriptionInterval = params.deliveryInteval;
            pli.custom.subproSubscriptionNumPeriods = parseInt(params.deliveryNumPeriods);
            var discountValue = parseFloat(params.discount);
            var discountToApply = params.isDiscountPercentage.getBooleanValue() === true
                ? new dw.campaign.PercentageDiscount(discountValue * 100)
                : new dw.campaign.AmountDiscount(discountValue);

            pli.custom.subproSubscriptionIsDiscountPercentage = params.isDiscountPercentage.getBooleanValue();
            pli.custom.subproSubscriptionDiscount = discountValue;

            /**
             * Remove previous 'SubscribeProDiscount' adjustments if any
             */
            var priceAdjustment = pli.getPriceAdjustmentByPromotionID('SubscribeProDiscount');
            pli.removePriceAdjustment(priceAdjustment);

            if (params.subscriptionMode.toString() === 'regular') {
                pli.createPriceAdjustment('SubscribeProDiscount', discountToApply);
            }

            /**
             * Set parameter on whole basket showing whether sub item is in cart
             */
            var plis = basket.getAllProductLineItems();
            var isSubpro = false;
            for (var i in plis) {
                isSubpro = plis[i].custom.subproSubscriptionSelectedOptionMode === 'regular';
                if (isSubpro) {
                    break;
                }
            }

            basket.custom.subproSubscriptionsToBeProcessed = isSubpro;

            res.json(new CartModel(basket));
        });
    }
    next();
});


module.exports = server.exports();
