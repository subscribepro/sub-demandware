'use strict';

var SystemObjectMgr = require('dw/object/SystemObjectMgr');

var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var StoreModel = require('*/cartridge/models/store');
var InventoryRecord = require('*/cartridge/models/inventoryRecord');
var SubProProductHelper = require('*/cartridge/scripts/subpro/helpers/productHelper');

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
            var SPInventoryRecord = new InventoryRecord(inventoryRecord);
            var SPInventoryEntryID = SPInventoryRecord.getInventoryRecordId();

            if (SPInventoryEntryID) {
                var updateInventoryRecordResponce = SubscribeProLib.updateInventoryRecord(SPInventoryEntryID, SPInventoryRecord);

                if (updateInventoryRecordResponce.result.code === 404) {
                    SPInventoryRecord.product_id = SubProProductHelper.getSPProductID(product);

                    if (SPInventoryRecord.product_id !== null) {
                        SPInventoryRecord.inventory_location_id = store.getSPLocationId();
                        var postInventoryRecordResponce = SubscribeProLib.postInventoryRecord(SPInventoryRecord);
                        if (!postInventoryRecordResponce.error) {
                            SPInventoryRecord.updateInventoryRecordId(postInventoryRecordResponce.result.inventory.id);
                        }
                    }
                }
            } else {
                SPInventoryRecord.product_id = SubProProductHelper.getSPProductID(product);
                SPInventoryRecord.inventory_location_id = store.getSPLocationId();
                if (SPInventoryRecord.product_id !== null) {
                    var postInventoryRecordResponce = SubscribeProLib.postInventoryRecord(SPInventoryRecord);
                    if (!postInventoryRecordResponce.error) {
                        SPInventoryRecord.updateInventoryRecordId(postInventoryRecordResponce.result.inventory.id);
                    } else if (postInventoryRecordResponce.result.code === 409) {
                        var getInventoryLocationResponce = SubscribeProLib.getInventoryRecord({
                            productId: SPInventoryRecord.product_id,
                            inventoryLocationId: SPInventoryRecord.inventory_location_id
                        });
                        if (!getInventoryLocationResponce.error) {
                            SPInventoryRecord.updateInventoryRecordId(getInventoryLocationResponce.result.inventory[0].id);
                        }
                    }
                }
            }
        }
    },

    postOrUpdateInventoryLocation: function (store) {
        if (store.getSPLocationId()) {
            var updateInventoryLocationResponce = SubscribeProLib.updateInventoryLocation(store.getSPLocationId(), store.payload);

            if (updateInventoryLocationResponce.result.code === 404) {
                var postInventoryLocationResponce = SubscribeProLib.postInventoryLocation(store.payload);
                if (!postInventoryLocationResponce.error) {
                    store.updateSPLocationId(postInventoryLocationResponce.result.inventory_location.id);
                }
                if (postInventoryLocationResponce.result.code === 409) {
                    var getInventoryLocationResponce = SubscribeProLib.getInventoryLocations();
                    if (!getInventoryLocationResponce.error) {
                        var existsLocation = getInventoryLocationResponce.result.inventory_locations.find(function (SPinventory_location) {
                            return SPinventory_location.name === store.payload.name;
                        });
                        if (!empty(existsLocation)) {
                            store.updateSPLocationId(existsLocation.id);
                        }
                    }
                }
            }
        } else {
            var postInventoryLocationResponce = SubscribeProLib.postInventoryLocation(store.payload);
            if (!postInventoryLocationResponce.error) {
                store.updateSPLocationId(postInventoryLocationResponce.result.inventory_location.id);
            } else if (postInventoryLocationResponce.result.code === 409) {
                var getInventoryLocationResponce = SubscribeProLib.getInventoryLocations();
                if (!getInventoryLocationResponce.error) {
                    var existsLocation = getInventoryLocationResponce.result.inventory_locations.find(function (SPinventory_location) {
                        return SPinventory_location.name === store.payload.name;
                    });
                    if (!empty(existsLocation)) {
                        store.updateSPLocationId(existsLocation.id);
                    }
                }
            }
        }
    }
};

module.exports = storeHelper;
