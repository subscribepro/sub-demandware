'use strict';

var Transaction = require('dw/system/Transaction');
var ProductInventoryMgr = require('dw/catalog/ProductInventoryMgr');
var currentSite = require('dw/system/Site').getCurrent();

/**
 * @constructor
 * @classdesc The stores model
 * @param {dw.catalog.Store} storeObject - a Store objects
 */
function Store(storeObject) {
    this.getSPLocationId = function () {
        if (storeObject.custom.SPLocationId) {
            var SPLocationIdObj = JSON.parse(storeObject.custom.SPLocationId);
            if (typeof SPLocationIdObj === 'object') {
                return SPLocationIdObj[currentSite.name] ? SPLocationIdObj[currentSite.name].id : null;
            }
        }
        return null;
    };

    if (storeObject) {
        this.ID = storeObject.ID;
        this.name = storeObject.name;
        this.address1 = storeObject.address1;
        this.address2 = storeObject.address2;
        this.city = storeObject.city;
        this.postalCode = storeObject.postalCode;
        this.latitude = storeObject.latitude;
        this.longitude = storeObject.longitude;
        this.apiStore = storeObject;

        if (storeObject.custom.SPLocationId) {
            this.SPLocationId = this.getSPLocationId();
        }

        if (storeObject.phone) {
            this.phone = storeObject.phone;
        }

        if (storeObject.email) {
            this.phone = storeObject.email;
        }

        if (storeObject.stateCode) {
            this.stateCode = storeObject.stateCode;
        }

        if (storeObject.countryCode) {
            this.countryCode = storeObject.countryCode.value;
        }

        if (storeObject.storeHours) {
            this.storeHours = storeObject.storeHours.markup;
        }

        if (storeObject.inventoryListID || storeObject.custom.inventoryListId) {
            this.inventoryListID = storeObject.inventoryListID ? storeObject.inventoryListID : storeObject.custom.inventoryListId;
        }
        if (storeObject.inventoryList) {
            this.inventoryLists = [storeObject.inventoryList];
        } else {
            var inventoryListIDs = this.inventoryListID.split(',');

            this.inventoryLists = inventoryListIDs.map(function (listID) {
                return ProductInventoryMgr.getInventoryList(listID);
            });
        }

        this.payload = {};

        this.payload.name = storeObject.ID;
        this.payload.location_code = storeObject.ID;

        if (storeObject.address1) {
            this.payload.street1 = storeObject.address1;
        }
        if (storeObject.address2) {
            this.payload.street2 = storeObject.address2;
        }
        if (storeObject.city) {
            this.payload.city = storeObject.city;
        }
        if (storeObject.postalCode) {
            this.payload.postcode = storeObject.postalCode;
        }

        if (storeObject.phone) {
            this.payload.phone = storeObject.phone;
        }

        if (storeObject.email) {
            this.payload.email = storeObject.email;
        }

        if (storeObject.stateCode) {
            this.payload.region = storeObject.stateCode;
        }

        if (storeObject.countryCode) {
            this.payload.country = storeObject.countryCode.value;
        }

        this.updateSPLocationId = function (newSPLocationId) {
            var curSPLocationId = JSON.parse(storeObject.custom.SPLocationId);
            if (empty(curSPLocationId)) {
                curSPLocationId = {};
            }

            curSPLocationId[currentSite.name] = { id: newSPLocationId };
            try {
                Transaction.wrap(function () {
                    storeObject.custom.SPLocationId = JSON.stringify(curSPLocationId);
                });
            } catch (e) {
                // Handle any exceptions or errors that occurred during the transaction

                // Rollback the transaction to revert any changes
                Transaction.rollback();
            }
            this.SPLocationId = newSPLocationId;
            this.apiStore = storeObject;
        };
    }
}

module.exports = Store;
