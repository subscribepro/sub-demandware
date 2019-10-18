var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var loggerMock = require('../../../../../mocks/dw/system/Logger');
var transactionMock = require('../../../../../mocks/dw/system/Transaction');
var subscribeProLibMock = require('../../../../../mocks/scripts/SubscribeProLibMock');
var customerHelper = proxyquire('../../../../../../cartridges/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/customerHelper', {
    '~/cartridge/scripts/subpro/lib/subscribeProLib': subscribeProLibMock,
    'dw/system/Logger': loggerMock,
    'dw/system/Transaction': transactionMock
});
var customerMockData = require('../../../../../mocks/scripts/CustomerMockData');

describe('customerHelpers', function () {
    it('getSubproCustomer should return an object in the format of a Subscribe Pro customer', function () {
        assert.deepEqual(customerHelper.getSubproCustomer(customerMockData.sfccCustomer), customerMockData.spCustomer);
    });

    it('findOrCreate customer should load and return a customer object in the SP customer format', function () {
        var customerId = customerHelper.findOrCreateCustomer(customerMockData.sfccCustomer);
        assert.equal(customerId, 12345);
    });

    it('createSubproCustomer should return the SP ID of the customer after creating one', function () {
        var customerId = customerHelper.createSubproCustomer(customerMockData.sfccCustomer);
        assert.equal(customerId, 12345);
    });

    it('setSubproCustomerID should update the SP ID of the customer', function () {
        customerHelper.setSubproCustomerID(customerMockData.sfccCustomer.getProfile(), 12346);
        assert.equal(12346, customerMockData.sfccCustomer.getProfile().custom.subproCustomerID);
        // reset it
        customerHelper.setSubproCustomerID(customerMockData.sfccCustomer.getProfile(), 12345);
    });
});
