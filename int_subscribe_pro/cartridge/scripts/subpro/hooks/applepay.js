/**
 * Subscribe Pro - Apple Pay Hooks
 * https://documentation.demandware.com/DOC1/topic/com.demandware.dochelp/DWAPI/scriptapi/html/api/class_dw_extensions_applepay_ApplePayHooks.html
 */
var Logger = require('dw/system/Logger');
var Transaction = require('dw/system/Transaction');
var OrderMgr = require('dw/order/OrderMgr');
var ApplePayHookResult = require('dw/extensions/applepay/ApplePayHookResult');
var Status = require('dw/system/Status');

/**
 * Create Order Hook
 * "Called after handling the given ApplePayPaymentAuthorizedEvent for the given basket."
 * We use this hook to update the Order with the necessary details of the subscription.
 */
exports.createOrder = function (basket, event) {
	let isSubPro = require('/int_subscribe_pro/cartridge/scripts/subpro/lib/SubscribeProLib.js').isSubPro();

	/**
	 * If this basket has a subscription,
	 * update details on the basket that will carry over to the order
	 */
	if (isSubPro) {
		Transaction.wrap(function () {
			basket.custom.subproContainsSubscriptions = isSubPro;
			basket.custom.subproSubscriptionsToBeProcessed = true;
		});
	}

	/**
	 * Create the order, so we can return it
	 */
	var order = Transaction.wrap(function () {
		return OrderMgr.createOrder(basket);
	});

	return order;
};