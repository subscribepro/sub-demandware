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
var batchIdList = '';

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
        var product = products.next();
        var productType = productHelper.getProductType(product);

        if (productType === 'variationGroup' || productType === 'set' || productType === 'optionProduct') continue;

        if (parameters.SynchronizeProducts === 'subscriptionEnabledProducts' && product.custom.subproSubscriptionEnabled) {
            return product;
        }
        if (parameters.SynchronizeProducts === 'allProducts') {
            return product;
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
        var postProductsResponse = SubscribeProLib.postProducts(filteredProducts.nonExistedProducts);
        var batchId = !postProductsResponse.error && postProductsResponse.result.batchId;
        batchIdList = batchIdList ? batchIdList + ',' + batchId : batchId;
    }

    if (filteredProducts.existedProducts.length) {
        filteredProducts.existedProducts.forEach(function (product) {
            patchProductModel(product, 'replace', patchProductfields);
        });
        var response = SubscribeProLib.patchProducts(patchProductfields);
    }
}

function afterChunk() {}

function afterStep() {
    var subProBatchIdList = SubscribeProLib.getCustomObject('subProBatchIdList', 'batchIdList', true);
    require('dw/system/Transaction').wrap(function () {
        subProBatchIdList.batchIdList = batchIdList;
    });
}

module.exports = {
    beforeStep: beforeStep,
    read: read,
    process: process,
    write: write,
    afterChunk: afterChunk,
    afterStep: afterStep
};
