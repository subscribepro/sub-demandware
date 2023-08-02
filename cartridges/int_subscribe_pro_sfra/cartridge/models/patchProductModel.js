'use strict';

function patchProductModel(product, operation, fieldsArr) {
    if (product) {
        Object.keys(product).map(function (key) {
            var newProductRecord = {};
            newProductRecord.op = operation;
            newProductRecord.ids = [product.id];
            newProductRecord.path = '/' + key;
            newProductRecord.value = product[key];
            fieldsArr.push(newProductRecord);
        });
    }
}

module.exports = patchProductModel;
