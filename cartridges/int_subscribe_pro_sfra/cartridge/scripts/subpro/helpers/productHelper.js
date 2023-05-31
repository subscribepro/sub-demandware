'use strict';
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var URLUtils = require('dw/web/URL');

var schedulingHelper = {
    /**
     * checkProductsWithSkuExistence
     * @param {Array<string>} productIds - array of products id`s
     * @returns {Object} result of check call with array of non existed products
     */
    checkProductsWithSkuExistence: function (products) {
        var array = require('*/cartridge/scripts/util/array');
        var result = { error: false, nonExistedProducts: [], existedProducts: [] };

        if (!empty(products)) {
            var filteringString = '';
            for (var i = 0; i < products.length; i++) {
                filteringString = filteringString + (i ? '&' : '') + 'sku[]=' + products[i].sku;
            }

            var response = SubscribeProLib.getFilteredProducts(filteringString);
            if (response.error) {
                return response;
            }

            if (!empty(response.result)) {
                for (var j = 0; j < products.length; j++) {
                    var product = products[j];
                    var matchedTemplateProduct = array.find(response.result, (templateProduct) => templateProduct.sku === product.sku);
                    if (empty(matchedTemplateProduct)) {
                        result.nonExistedProducts.push(product);
                    } else {
                        product.id = matchedTemplateProduct.id;
                        result.existedProducts.push(product);
                    }
                }
            } else {
                result.nonExistedProducts = products;
            }
        }
        return result;
    }
};

module.exports = schedulingHelper;
