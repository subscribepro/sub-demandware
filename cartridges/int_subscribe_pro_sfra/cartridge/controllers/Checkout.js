'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('Begin', function (req, res, next) {
    var subproEnabled = require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproEnabled');
    var SubscribeProLib = require('*/cartridge/scripts/subpro/lib/subscribeProLib.js');
    var viewData = res.getViewData();
    if (subproEnabled) {
        viewData.isSubscriptionItemInCart = SubscribeProLib.isBasketHasSubscriptionItem();
    }
    res.setViewData(viewData);
    next();
});

module.exports = server.exports();
