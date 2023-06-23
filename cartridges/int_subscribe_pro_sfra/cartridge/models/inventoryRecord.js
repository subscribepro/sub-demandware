'use strict';

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
}

module.exports = InventoryRecord;
