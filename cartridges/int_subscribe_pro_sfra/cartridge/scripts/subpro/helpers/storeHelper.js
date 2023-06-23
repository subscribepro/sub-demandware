'use strict';

var SystemObjectMgr = require('dw/object/SystemObjectMgr');
var Transaction = require('dw/system/Transaction');

var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var StoreModel = require('*/cartridge/models/store');
var InventoryRecord = require('*/cartridge/models/inventoryRecord');

var storeHelper = {
    /**
     * getAllStores
     */
    getAllStores: function () {
        var locationsList = [];
        var storesIterator = SystemObjectMgr.querySystemObjects('Store', '', 'ID DESC');
        while (storesIterator.hasNext()) {
            locationsList.push(new StoreModel(storesIterator.next()));
        }
        return locationsList;
    },

    postOrUpdateInventoryRecord: function (product, store, storeInventoryRecord) {
        var inventoryRecord = product.getAvailabilityModel().getInventoryRecord();
        if (inventoryRecord) {
            var SPInventoryEntryID = storeInventoryRecord.custom.SPInventoryEntryID;
            var SPInventoryRecord = new InventoryRecord(inventoryRecord);
            try {
                Transaction.wrap(function () {
                    if (SPInventoryEntryID) {
                        var updateInventoryRecordResponce = SubscribeProLib.updateInventoryRecord(SPInventoryEntryID, SPInventoryRecord);

                        if (updateInventoryRecordResponce.result.code === 404) {
                            SPInventoryRecord.product_id = product.custom.SPProductID;
                            SPInventoryRecord.inventory_location_id = store.SPLocationId;
                            var postInventoryRecordResponce = SubscribeProLib.postInventoryRecord(SPInventoryRecord);
                            if (!postInventoryRecordResponce.error) {
                                storeInventoryRecord.custom.SPInventoryEntryID = postInventoryRecordResponce.result.inventory.id;
                            }
                        }
                    } else {
                        SPInventoryRecord.product_id = product.custom.SPProductID;
                        SPInventoryRecord.inventory_location_id = store.SPLocationId;

                        var postInventoryRecordResponce = SubscribeProLib.postInventoryRecord(SPInventoryRecord);
                        if (!postInventoryRecordResponce.error) {
                            storeInventoryRecord.custom.SPInventoryEntryID = postInventoryRecordResponce.result.inventory.id;
                        }
                    }
                });
            } catch (e) {
                // Handle any exceptions or errors that occurred during the transaction

                // Rollback the transaction to revert any changes
                Transaction.rollback();
            }
        }
    },

    postOrUpdateInventoryLocation: function (store) {
        if (store.SPLocationId) {
            var updateInventoryLocationResponce = SubscribeProLib.updateInventoryLocation(store.SPLocationId, store.payload);

            if (updateInventoryLocationResponce.result.code === 404) {
                var postInventoryLocationResponce = SubscribeProLib.postInventoryLocation(store.payload);
                if (!postInventoryLocationResponce.error) {
                    store.updateSPLocationId(postInventoryLocationResponce.result.inventory_location.id);
                }
            }
        } else {
            var postInventoryLocationResponce = SubscribeProLib.postInventoryLocation(store.payload);
            if (!postInventoryLocationResponce.error) {
                store.updateSPLocationId(postInventoryLocationResponce.result.inventory_location.id);
            }
        }
    }
};

module.exports = storeHelper;
