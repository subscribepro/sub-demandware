'use strict';

import _ from 'lodash';
import {assert} from 'chai';
import sinon from 'sinon';
let proxyquire = require('proxyquire').noCallThru();

/**
 * Mocks
 *
 */
let mockResource = require('../../../../mocks/dw/web/Resource');
let mockProductAvailabilityModel = {
    AVAILABILITY_STATUS_IN_STOCK: 'prop1',
    AVAILABILITY_STATUS_PREORDER: 'prop2',
    AVAILABILITY_STATUS_BACKORDER: 'prop3',
    AVAILABILITY_STATUS_NOT_AVAILABLE: 'prop4'
};
let ProductUtils = proxyquire('../../../../../app_storefront_core/cartridge/scripts/product/ProductUtils.js', {
    'dw/system/Site': {},
    'dw/catalog/CatalogMgr': {},
    'dw/catalog/ProductAvailabilityModel': mockProductAvailabilityModel,
    'dw/util/StringUtils': {},
    'dw/util/HashMap': {},
    'dw/value/Money': {},
    'dw/web/HttpParameterMap': {},
    'dw/campaign/Promotion': {},
    'dw/campaign/PromotionMgr': {},
    'dw/web/Resource': mockResource,
    '~/cartridge/scripts/util/StringHelpers': {}
});
let mockProductAvailabilityLevels = {
    notAvailable: {value: 0},
    inStock: {value: 50},
    preorder: {value: 0},
    backorder: {value: 0}
};
let availabilityModel = {
    availability: 6,
    availabilityStatus: 'sample status',
    inStock: 10,
    inventoryRecord: {
        ATS: {value: 13},
        inStockDate: new Date()
    },
    getAvailabilityLevels: () => mockProductAvailabilityLevels
};

describe('ProductUtils', () => {
    describe('getAvailability()', () => {
        let defaultProduct = {
            availabilityModel: availabilityModel
        };

        it('should set ats to the ATS.value in inventoryRecord', () => {
            let product = _.merge({}, defaultProduct);
            let atsValue = 22;
            product.availabilityModel.inventoryRecord.ATS.value = atsValue;
            let availability = ProductUtils.getAvailability(product, 5);
            assert.equal(availability.ats, atsValue);
        });

        it('should set ats to zero when no inventory record', () => {
            let product = _.merge({}, defaultProduct);
            product.availabilityModel.inventoryRecord = undefined;
            let availability = ProductUtils.getAvailability(product, 5);
            assert.equal(availability.ats, 0);
        });

        it('should set availableForSale to true when ProductAvailabilityModel.available greater than 0', () => {
            let availability = ProductUtils.getAvailability(defaultProduct, 5);
            assert.isTrue(availability.availableForSale);
        });

        it('should set availableForSale to false when ProductAvailabilityModel.available equals 0', () => {
            let product = _.merge({}, defaultProduct);
            product.availabilityModel.availability = 0;
            let availability = ProductUtils.getAvailability(product, 5);
            assert.isFalse(availability.availableForSale);
        });

        it('should call ProductAvailabilityModel\'s getAvailabilityLevels method', () => {
            let stubGetAvailabilityLevels = sinon.spy(availabilityModel, 'getAvailabilityLevels');
            ProductUtils.getAvailability(defaultProduct, 5);
            assert.isTrue(stubGetAvailabilityLevels.called);
            stubGetAvailabilityLevels.restore();
        });

        it('should set statusQuantity to 2nd input param', () => {
            let quantity = 5;
            let availability = ProductUtils.getAvailability(defaultProduct, quantity);
            assert.equal(availability.statusQuantity, quantity);
        });

        it('should accept a Number for its 2nd input param', () => {
            let quantityNumber = 5;
            let availability = ProductUtils.getAvailability(defaultProduct, quantityNumber);
            assert.equal(availability.statusQuantity, quantityNumber);
        });

        it('should accept a String for its 2nd input param', () => {
            let quantityString = '5';
            let availability = ProductUtils.getAvailability(defaultProduct, quantityString);
            assert.equal(availability.statusQuantity, quantityString);
        });

        it('should set the inStock property to the ProductAvailabilityModel.inStock value', () => {
            let availability = ProductUtils.getAvailability(defaultProduct, 5);
            assert.equal(availability.inStock, defaultProduct.availabilityModel.inStock);
        });

        it('should set inStock date to inventoryRecord\'s inStockDate', () => {
            let availability = ProductUtils.getAvailability(defaultProduct, 5);
            assert.equal(availability.inStockDate, defaultProduct.availabilityModel.inventoryRecord.inStockDate.toDateString());
        });

        it('should set status to ProductAvailabilityModel.availabilityStatus', () => {
            let availabilityStatus = availabilityModel.availabilityStatus;
            let availability = ProductUtils.getAvailability(defaultProduct, 5);
            assert.equal(availability.status, availabilityStatus);
        });

        it('should set levels to ProductAvailabilityLevels', () => {
            let availability = ProductUtils.getAvailability(defaultProduct, 5);
            let expectedLevels = {};
            expectedLevels[mockProductAvailabilityModel.AVAILABILITY_STATUS_IN_STOCK] = mockProductAvailabilityLevels.inStock.value;
            expectedLevels[mockProductAvailabilityModel.AVAILABILITY_STATUS_PREORDER] = mockProductAvailabilityLevels.preorder.value;
            expectedLevels[mockProductAvailabilityModel.AVAILABILITY_STATUS_BACKORDER] = mockProductAvailabilityLevels.backorder.value;
            expectedLevels[mockProductAvailabilityModel.AVAILABILITY_STATUS_NOT_AVAILABLE] = mockProductAvailabilityLevels.notAvailable.value;
            assert.deepEqual(availability.levels, expectedLevels);
        });

        it('should set isAvailable to true when notAvailable is 0', () => {
            let product = _.merge({}, defaultProduct);
            let notAvailable = 0;
            let sampleLevels = _.merge({}, mockProductAvailabilityLevels);
            sampleLevels.notAvailable.value = notAvailable;
            let stubGetAvailabilityLevels = sinon.stub(product.availabilityModel, 'getAvailabilityLevels').returns(sampleLevels);
            let availability = ProductUtils.getAvailability(product, 5);
            assert.isTrue(availability.isAvailable);
            stubGetAvailabilityLevels.restore();
        });

        it('should set isAvailable to false when notAvailable is not 0', () => {
            let product = _.merge({}, defaultProduct);
            let notAvailable = 2;
            let sampleLevels = _.merge({}, mockProductAvailabilityLevels);
            sampleLevels.notAvailable.value = notAvailable;
            let stubGetAvailabilityLevels = sinon.stub(product.availabilityModel, 'getAvailabilityLevels').returns(sampleLevels);
            let availability = ProductUtils.getAvailability(product, 5);
            assert.isFalse(availability.isAvailable);
            stubGetAvailabilityLevels.restore();
        });
    });
});
