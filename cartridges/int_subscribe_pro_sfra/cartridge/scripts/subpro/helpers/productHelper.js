'use strict';
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var URLUtils = require('dw/web/URL');

var schedulingHelper = {
    /**
     * checkProductsWithSkuExistence
     * @param {Array<string>} products - array of products id`s
     * @returns {Object} result of check call with array of non existed products
     */
    checkProductsWithSkuExistence: function (products) {
        var array = require('*/cartridge/scripts/util/array');
        var result = { error: false, nonExistedProducts: [], existedProducts: [] };

        if (!empty(products)) {
            var filteringString = '';

            products.forEach(function (product, i) {
                filteringString = filteringString + (i ? '&' : '') + 'sku[]=' + product.sku;
            });

            filteringString = filteringString + '&itemsPerPage=' + products.length;

            var response = SubscribeProLib.getFilteredProducts(filteringString);
            if (response.error) {
                return response;
            }

            if (!empty(response.result)) {
                products.forEach(function (product) {
                    var matchedTemplateProduct = array.find(response.result, (templateProduct) => templateProduct.sku === product.sku);
                    if (empty(matchedTemplateProduct)) {
                        result.nonExistedProducts.push(product);
                    } else {
                        product.id = matchedTemplateProduct.id;
                        result.existedProducts.push(product);
                    }
                });
            } else {
                result.nonExistedProducts = products;
            }
        }
        return result;
    },

    findIdByName: function (arr, name) {
        var foundObject = arr.find((obj) => obj.name === name);
        return foundObject ? foundObject.id : null;
    }
};

module.exports = schedulingHelper;
