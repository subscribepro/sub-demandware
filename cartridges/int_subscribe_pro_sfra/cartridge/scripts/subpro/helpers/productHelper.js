'use strict';

var ProductMgr = require('dw/catalog/ProductMgr');

var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var URLUtils = require('dw/web/URL');
var Transaction = require('dw/system/Transaction');
var currentSite = require('dw/system/Site').getCurrent();

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
                        if (!product.SPProductID) {
                            var apiProduct = ProductMgr.getProduct(product.sku);

                            schedulingHelper.updateSPProductID(apiProduct, matchedTemplateProduct.id);
                        }
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
    },

    updateSPProductID: function (apiProduct, newSPProductID) {
        var SPProductID = JSON.parse(apiProduct.custom.SPProductID);
        if (empty(SPProductID)) {
            SPProductID = {};
        }

        SPProductID[currentSite.name] = { id: newSPProductID };
        try {
            Transaction.wrap(function () {
                apiProduct.custom.SPProductID = JSON.stringify(SPProductID);
            });
        } catch (e) {
            // Handle any exceptions or errors that occurred during the transaction

            // Rollback the transaction to revert any changes
            Transaction.rollback();
        }
    },

    getSPProductID: function (apiProduct) {
        try {
            if (apiProduct.custom.SPProductID) {
                var SPProductIDObj = JSON.parse(apiProduct.custom.SPProductID);
                if (typeof SPProductIDObj === 'object') {
                    return SPProductIDObj[currentSite.name] ? SPProductIDObj[currentSite.name].id : null;
                }
            }
        } catch (e) {
            var a = 5;
        }
        return null;
    }
};

module.exports = schedulingHelper;
