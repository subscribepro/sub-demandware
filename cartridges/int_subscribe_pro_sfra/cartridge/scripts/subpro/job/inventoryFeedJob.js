'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-loop-func */

var productSPJobModel = require('*/cartridge/models/productSPJobModel');
var patchProductModel = require('*/cartridge/models/patchProductModel');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var SubProProductHelper = require('*/cartridge/scripts/subpro/helpers/productHelper');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var ProductMgr = require('dw/catalog/ProductMgr');

var products;

/**
 * @function beforeStep
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function beforeStep(parameters, stepExecution) {
    products = ProductMgr.queryAllSiteProducts();
}

/**
 * @function read
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 * @returns {dw.order.Product} product
 */
function read(parameters, stepExecution) {
    while (products.hasNext()) {
        var apiProduct = products.next();
        var productType = productHelper.getProductType(apiProduct);

        if (productType === 'variationGroup' || productType === 'set' || productType === 'optionProduct') continue;

        if (parameters.SynchronizeProducts === 'subscriptionEnabledProducts' && apiProduct.custom.subproSubscriptionEnabled) {
            return apiProduct;
        }

        if (parameters.SynchronizeProducts === 'allProducts') {
            return apiProduct;
        }
    }
}

/**
 * @param {dw.order.Product} product
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 * @returns {Object} feedProduct
 */
function process(product, parameters, stepExecution) {
    if (product) {
        var feedProduct = new productSPJobModel(product);

        return feedProduct;
    }
}

/**
 * Process chunk
 * @param {Array} lines - lines
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function write(lines, parameters, stepExecution) {
    var patchProductfields = [];
    var filteredProducts = SubProProductHelper.checkProductsWithSkuExistence(lines.toArray());

    if (filteredProducts.nonExistedProducts.length) {
        filteredProducts.nonExistedProducts.forEach(function (SPProduct) {
            delete SPProduct.SPProductID;
            var postProductResponse = SubscribeProLib.postProduct(SPProduct);
            if (!postProductResponse.error) {
                var apiProduct = ProductMgr.getProduct(SPProduct.sku);
                SubProProductHelper.updateSPProductID(apiProduct, postProductResponse.result.product.id);
            }
        });
    }

    if (filteredProducts.existedProducts.length) {
        filteredProducts.existedProducts.forEach(function (product) {
            patchProductModel(product, 'replace', patchProductfields);
        });
        var response = SubscribeProLib.patchProducts(patchProductfields);
    }
}

module.exports = {
    beforeStep: beforeStep,
    read: read,
    process: process,
    write: write
};
