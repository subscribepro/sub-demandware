'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');
var page = module.superModule;

server.extend(page);

server.append('Login', function (req, res, next) {
    var viewData = res.getViewData();
    var basket = BasketMgr.getCurrentOrNewBasket();
    if (subproEnabled) {
        var lineItems = basket.getAllProductLineItems();

        var subscriptionInCart = false;
        for (var i in lineItems) {
            var li = lineItems[i];
            if (li.custom.subproSubscriptionSelectedOptionMode === 'regular') {
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
