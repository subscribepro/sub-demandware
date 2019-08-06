"use strict";

var processInclude = require("../../../../../../../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/util");

$(document).ready(function () {
    processInclude(require("./subscriptionOptions"));
    processInclude(require("../../../../../../../storefront-reference-architecture/cartridges/app_storefront_base/cartridge/client/default/js/cart/cart"));
});
