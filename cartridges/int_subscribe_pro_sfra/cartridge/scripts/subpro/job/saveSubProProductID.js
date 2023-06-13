'use strict';

var Status = require('dw/system/Status');
var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var ArrayList = require('dw/util/ArrayList');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

function saveSubProProductID(args) {
    var subProBatchIdList = SubscribeProLib.getCustomObject('subProBatchIdList', 'batchIdList', true);
    var product = null;
    var productSearchModel = new ProductSearchModel();
    productSearchModel.setCategoryID('root');
    if (subProBatchIdList.batchIdList) {
        var batchIdList = subProBatchIdList.batchIdList.split(',');
        var workBatchIdList = subProBatchIdList.batchIdList.split(',');

        while (batchIdList.length > 0) {
            try {
                batchIdList.forEach(function (batchId) {
                    var getBatchStatusResponse = SubscribeProLib.getBatchStatus(batchId);

                    if (!getBatchStatusResponse.error) {
                        if (getBatchStatusResponse.result.isComplete) {
                            var delIndex = workBatchIdList.indexOf(batchId);
                            workBatchIdList.splice(delIndex, 1);
                            getBatchStatusResponse.result.result.forEach(function (item) {
                                var { status, message } = JSON.parse(item);
                                var { sku, id } = message;
                                if (status === 200 || status === 201) {
                                    productSearchModel.setProductIDs(new ArrayList([sku]));
                                    productSearchModel.search();
                                    var productSearchHits = productSearchModel.getProductSearchHits();
                                    if (productSearchHits.hasNext()) {
                                        var productSearchHit = productSearchHits.next();
                                        var product = productSearchHit.getFirstRepresentedProduct();
                                        if (!empty(product)) {
                                            product.custom.SPProductID = id;
                                        }
                                    }
                                }
                            });
                        }
                    } else {
                        throw new Error('Error getting product status by batchId', getBatchStatusResponse.message);
                    }
                });
                batchIdList = workBatchIdList.slice();
            } catch (e) {
                require('dw/system/Logger').error('Error updating product status by batchId. ', e);
                break;
            }
        }
    }
}

exports.saveSubProProductID = saveSubProProductID;
