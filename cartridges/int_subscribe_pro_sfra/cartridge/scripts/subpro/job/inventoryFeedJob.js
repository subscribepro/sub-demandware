'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-loop-func */

var ProductSearchModel = require('dw/catalog/ProductSearchModel');

var productSPJobModel = require('*/cartridge/models/productSPJobModel');
var patchProductModel = require('*/cartridge/models/patchProductModel');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var SubProProductHelper = require('*/cartridge/scripts/subpro/helpers/productHelper');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

var Logger = require('dw/system/Logger');

var productSearchHits;
var productSearchModel;

/**
 * @function beforeStep
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function beforeStep(parameters, stepExecution) {
    /** Get all products for this site */
    productSearchModel = new ProductSearchModel();
    productSearchModel.setCategoryID('root');
    productSearchModel.setRecursiveCategorySearch(true);
    productSearchModel.setOrderableProductsOnly(false);
    productSearchModel.search();
    productSearchHits = productSearchModel.getProductSearchHits();
}

/**
 * @function read
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 * @returns {dw.order.Product} product
 */
function read(parameters, stepExecution) {
    while (productSearchHits.hasNext()) {
        var productSearchHit = productSearchHits.next();
        var product = productSearchHit.getProduct();
        var productType = productHelper.getProductType(product);

        if (productType === 'variationGroup' || productType === 'set' || productType === 'optionProduct') continue;

        if (parameters.SynchronizeProducts === 'subscriptionEnabledProducts' && product.custom.subproSubscriptionEnabled) {
            return product;
        }
        if (parameters.SynchronizeProducts === 'allProducts') {
            return product;
        }

        continue;
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
    var filteredProducts = SubProProductHelper.checkProductsWithSkuExistence(lines);

    if (filteredProducts.nonExistedProducts.length) {
        var response = SubscribeProLib.postProducts(filteredProducts.nonExistedProducts);
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
