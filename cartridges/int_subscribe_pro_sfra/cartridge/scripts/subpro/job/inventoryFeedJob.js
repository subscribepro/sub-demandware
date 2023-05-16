'use strict';

/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-loop-func */

var ProductSearchModel = require('dw/catalog/ProductSearchModel');

var productSPJobModel = require('*/cartridge/models/productSPJobModel');

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
    var jsonFeed = JSON.stringify(lines.toArray());

    Logger.error('write: {0}', jsonFeed);
}

/**
 * @function getTotalCount
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 * @returns {number} Returns the total number of products to process for the current job-run.
 */
function getTotalCount(parameters, stepExecution) {
    // return productSearchHits.getCount();
}

/**
 * @function afterStep
 * @param {boolean} success - success
 * @param {Array} parameters - parameters
 * @param {dw.job.JobStepExecution} stepExecution - stepExecution
 */
function afterStep(success, parameters, stepExecution) {
    var a = 5;
}

module.exports = {
    beforeStep: beforeStep,
    getTotalCount: getTotalCount,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};
