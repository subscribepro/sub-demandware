"use strict";

var server = require("server"),
    BasketMgr = require("dw/order/BasketMgr"),
    subproEnabled = require("dw/system/Site").getCurrent().getCustomPreferenceValue("subproEnabled"),
    page = module.superModule;

server.extend(page);

server.append("Login", function (req, res, next) {
    let viewData = res.getViewData(),
        basket = BasketMgr.getCurrentOrNewBasket();
    if (subproEnabled) {
        let lineItems = basket.getAllProductLineItems();

        let subscriptionInCart = false;
        for (var i in lineItems) {
            let li = lineItems[i];
            if (li.custom.subproSubscriptionSelectedOptionMode === "regular") {
                subscriptionInCart = true;
                break;
            }
        }

        viewData.subscriptionInCart = subscriptionInCart;
    }
    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
