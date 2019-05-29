'use strict';

var processInclude = require('../../../../../app_storefront_base/cartridge/client/default/js/util');

$(document).ready(function () {
    processInclude(require('../../../../../app_storefront_base/cartridge/client/default/js/product/detail'));
    processInclude(require('./subscriptionOptions'));
});
