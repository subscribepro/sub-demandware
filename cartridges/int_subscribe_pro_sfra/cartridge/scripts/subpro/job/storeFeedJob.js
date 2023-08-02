'use strict';

var ProductMgr = require('dw/catalog/ProductMgr');

var SubProStoreHelper = require('*/cartridge/scripts/subpro/helpers/storeHelper');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');

var stores;
var products;

function beforeStep(parameters, stepExecution) {
    stores = SubProStoreHelper.getAllStores();
    stores.forEach(function (store) {
        SubProStoreHelper.postOrUpdateInventoryLocation(store);
    });
    products = ProductMgr.queryAllSiteProducts();
}

// eslint-disable-next-line consistent-return
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
 * @param {XML} productNode
 */
function process(product, parameters, stepExecution) {
    stores.forEach(function (store) {
        store.inventoryLists.forEach(function (inventoryList) {
            if (!empty(inventoryList)) {
                var storeInventoryRecord = inventoryList.getRecord(product.ID);
                if (storeInventoryRecord) {
                    SubProStoreHelper.postOrUpdateInventoryRecord(product, store, storeInventoryRecord);
                }
            }
        });
    });

    return product;
}

/**
 * @param {dw.util.List<string>} productIDs
 */
function write(lines, parameters, stepExecution) {}

function afterStep() {}

module.exports = {
    beforeStep: beforeStep,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};
