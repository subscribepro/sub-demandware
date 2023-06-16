'use strict';

var ProductSearchModel = require('dw/catalog/ProductSearchModel');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');
var ArrayList = require('dw/util/ArrayList');
var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
var SubProProductHelper = require('*/cartridge/scripts/subpro/helpers/productHelper');
var ProductMgr = require('dw/catalog/ProductMgr');

/**
 * @type {import('../models/XMLReader')}
 */
var xmlReader;
/**
 * @type {Generator<XML, XML, unknown>}
 */
var getNodeGenerator;
var productSearchModel;
var productSearchHits;

function postOrUpdate(inventoryRecord, data, SPInventoryEntryID) {
    if (SPInventoryEntryID) {
        data.SPInventoryEntryID = SPInventoryEntryID;
        var updateInventoryRecordResponce = SubscribeProLib.updateInventoryRecord(data);

        if (updateInventoryRecordResponce.result.code === 404) {
            var postInventoryRecordResponce = SubscribeProLib.postInventoryRecord(data);
            if (!postInventoryRecordResponce.error) {
                inventoryRecord.custom.SPInventoryEntryID = postInventoryRecordResponce.result.inventory.id;
            }
        }
    } else {
        var postInventoryRecordResponce = SubscribeProLib.postInventoryRecord(data);
        if (!postInventoryRecordResponce.error) {
            inventoryRecord.custom.SPInventoryEntryID = postInventoryRecordResponce.result.inventory.id;
        }
    }
}

function beforeStep(params) {
    xmlReader = new (require('*/cartridge/models/XMLReader'))(params.InventoryFile, true);

    if (xmlReader.isClosed && params.NoFileFoundStatus === 'ERROR') {
        throw new Error('File does not exist');
    }

    getNodeGenerator = xmlReader.getNode('record');
}

// eslint-disable-next-line consistent-return
function read() {
    try {
        var node = getNodeGenerator.next();
        var schema = {};
        var data = xmlReader.parseXMLNode(schema, node.value);

        data.sku = xmlReader.productID;
        data.list_id = xmlReader.listId;
        return data;
    } catch (e) {
        if (e instanceof StopIteration) {
            return undefined;
        }
    }
}

/**
 * @param {XML} productNode
 */
function process(data) {
    var product = ProductMgr.getProduct(data.sku);
    if (!empty(product)) {
        data.product_id = product.getCustom().SPProductID;
    } else {
        data.product_id = '';
    }

    if (data.product_id) {
        var inventoryList = ProductInventoryMgr.getInventoryList(data.list_id);
        var SPListId = inventoryList.custom.SPListId;
        var inventoryRecord = inventoryList.getRecord(data.sku);
        var SPInventoryEntryID = inventoryRecord && inventoryRecord.custom.SPInventoryEntryID;

        if (!empty(inventoryRecord)) {
            data.qty_in_stock = inventoryRecord.getStockLevel().value;
            data.is_in_stock = inventoryRecord.getStockLevel().available;
            data.qty_available = inventoryRecord.getATS().value;
            data.qty_reserved = inventoryRecord.getReserved().value;
        } else {
            data.qty_in_stock = 0;
            data.is_in_stock = false;
            data.qty_available = 0;
            data.qty_reserved = 0;
        }

        if (SPListId) {
            data.inventory_location_id = SPListId;
            postOrUpdate(inventoryRecord, data, SPInventoryEntryID);
        } else {
            var locationsResponce = SubscribeProLib.postInventoryLocation(data.list_id);

            if (!locationsResponce.error) {
                data.inventory_location_id = locationsResponce.result.inventory_location.id;
                inventoryList.custom.SPListId = locationsResponce.result.inventory_location.id;
                postOrUpdate(inventoryRecord, data, SPInventoryEntryID);
            } else if (locationsResponce.result.code === 409) {
                var updateInventoryLocationResponce = SubscribeProLib.getInventoryLocations();
                if (!updateInventoryLocationResponce.error) {
                    SPListId = SubProProductHelper.findIdByName(updateInventoryLocationResponce.result.inventory_locations, data.list_id);
                    data.inventory_location_id = SPListId;
                    inventoryList.custom.SPListId = SPListId;

                    postOrUpdate(inventoryRecord, data, SPInventoryEntryID);
                }
            }
        }
    }

    return data;
}

/**
 * @param {dw.util.List<string>} productIDs
 */
function write(lines, parameters, stepExecution) {}

function afterStep() {
    xmlReader && xmlReader.closeReader();
}

module.exports = {
    beforeStep: beforeStep,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};
