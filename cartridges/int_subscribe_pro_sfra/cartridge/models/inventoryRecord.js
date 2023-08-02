'use strict';

var Transaction = require('dw/system/Transaction');
var currentSite = require('dw/system/Site').getCurrent();

/**
 * @constructor
 * @classdesc The inventoryRecord model
 * @param {dw.catalog.Store} inventoryRecord - a inventoryRecord objects
 */
function InventoryRecord(inventoryRecord) {
    if (inventoryRecord) {
        this.qty_in_stock = inventoryRecord.getStockLevel().value;
        this.is_in_stock = inventoryRecord.getStockLevel().available;
        this.qty_available = inventoryRecord.getATS().value;
        this.qty_reserved = inventoryRecord.getReserved().value;
    }
    this.updateInventoryRecordId = function (newSPInventoryEntryID) {
        var curInventoryRecord = JSON.parse(inventoryRecord.custom.SPInventoryEntryID);
        if (empty(curInventoryRecord)) {
            curInventoryRecord = {};
        }

        curInventoryRecord[currentSite.name] = { id: newSPInventoryEntryID };
        try {
            Transaction.wrap(function () {
                inventoryRecord.custom.SPInventoryEntryID = JSON.stringify(curInventoryRecord);
            });
        } catch (e) {
            Transaction.rollback();
        }
    };

    this.getInventoryRecordId = function () {
        if (inventoryRecord.custom.SPInventoryEntryID) {
            var inventoryRecordObj = JSON.parse(inventoryRecord.custom.SPInventoryEntryID);
            if (typeof inventoryRecordObj === 'object') {
                return inventoryRecordObj[currentSite.name] ? inventoryRecordObj[currentSite.name].id : null;
            }
        }

        return null;
    };
}

module.exports = InventoryRecord;
