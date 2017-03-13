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
 * Renders product subscription options.
 *
 * Gets product SKU from the httpParameterMap.
 */
function productSubscriptionsPDP() {
    let response = SubscribeProLib.getProduct(params.sku);

    if (response.error || !response.result.products.length) {
        return;
    }

    let product = response.result.products.pop();

    ISML.renderTemplate('subpro/product/subprooptions.isml', {
        product: product
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