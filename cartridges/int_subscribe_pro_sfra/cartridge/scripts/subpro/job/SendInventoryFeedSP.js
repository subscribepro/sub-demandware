'use strict';
var ProductMgr = require('dw/catalog/ProductMgr');

/**
 * @type {import('../models/XMLReader')}
 */
var xmlReader;
/**
 * @type {Generator<XML, XML, unknown>}
 */
var getNodeGenerator;

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
        // if (getNodeGenerator.next()) {
        var node = getNodeGenerator.next();
        var schema = {
            allocation: 'allocation',
            allocationTimestamp: '["allocation-timestamp"]',
            perpetual: 'perpetual',
            preorderBackorderHandling: '["preorder-backorder-handling"]',
            inStockDatetime: '["in-stock-datetime"]',
            inStockDate: '["in-stock-date"]',
            ats: 'ats',
            onOrder: '["on-order"]',
            turnover: '["turnover"]'
        };

        // if (node.value) {
        var data = xmlReader.parseXMLNode(schema, node.value);
        return data;
        // } else {
        // continue;
        // }
        // }
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
    return data;
}

/**
 * @param {dw.util.List<string>} productIDs
 */
function write(lines, parameters, stepExecution) {
    require('dw/system/Logger').error('SendInventoryFeedSP Job has results "{0}"', JSON.stringify(lines.toArray()));
}

function afterChunk() {}

function afterStep() {
    xmlReader && xmlReader.closeReader();
}

module.exports = {
    beforeStep: beforeStep,
    afterChunk: afterChunk,
    read: read,
    process: process,
    write: write,
    afterStep: afterStep
};

// var productID = inventoryNode.toString()
// var productID = inventoryNode.value.attribute('product-id').toString();
// var ee = inventoryNode.value.node('allocation').toString();
// var value = inventoryNode.value.getAttributeValue(null, 'allocation').toString();
// var r = xmlReader;
// var data = inventoryNode.value.child({ perpetual: 'perpetual' });
// var data1 = inventoryNode.value.attributes();
// var data2 = inventoryNode.value.childIndex();
// var data3 = inventoryNode.value.children();
// var data4 = inventoryNode.value.records;
// var order = (
//     <order>
//         <item quantity="1">Apple</item>
//         <item quantity="2">Peach</item>
//     </order>
// );

// var items = order.item;
// var item = order.item[0];
// var quantity = order.item[0].@quantity;
// var singleItem = order.item.(@quantity == 1);

// var record = (
//     <record xmlns="http://www.demandware.com/xml/impex/inventory/2007-05-31" product-id="883360352015M">
//         <allocation>3</allocation>
//         <allocation-timestamp>2022-07-28T21:01:47.000Z</allocation-timestamp>
//         <perpetual>false</perpetual>
//         <preorder-backorder-handling>none</preorder-backorder-handling>
//         <ats>3</ats>
//         <on-order>0</on-order>
//         <turnover>0</turnover>
//     </record>
// );
