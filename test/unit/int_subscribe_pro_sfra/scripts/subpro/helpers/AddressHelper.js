var assert = require('chai').assert;
var loggerMock = require('../../../../../mocks/dw/system/Logger');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var transactionMock = require('../../../../../mocks/dw/system/Transaction');
var addressHelper = proxyquire('../../../../../../cartridges/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/addressHelper', {
    'dw/system/Logger': loggerMock,
    'dw/system/Transaction': transactionMock
});
var addressHelperMockData = require('../../../../../mocks/scripts/AddressMockData');

describe('addressHelpers', function () {
    it('getSubproAddress should return an address object in the format of a Subscribe Pro address', function () {
        assert.deepEqual(addressHelper.getSubproAddress(addressHelperMockData.sfccAddress, addressHelperMockData.sfccProfile, true, false), addressHelperMockData.spAddress);
    });

    it('compareAddresses should return true if two addresses are the same', function () {
        assert.isTrue(addressHelper.compareAddresses(addressHelperMockData.sfccAddress, addressHelperMockData.sfccAddress));
    });

    it('setSubproAddressID should set the ID from an address in SP on an address in SFCC', function () {
        var address = addressHelperMockData.sfccAddress;
        addressHelper.setSubproAddressID(address, 12301);
        assert.equal(address.custom.subproAddressID, 12301);
        // Reset the ID for future tests
        addressHelper.setSubproAddressID(address, 1116883);
    });

    it('getCustomerAddress should look up an address in the address book and return it, or null', function () {
        assert.isNull(addressHelper.getCustomerAddress(addressHelperMockData.addressBook.addresses, {}));
        assert.isTrue(addressHelper.compareAddresses(addressHelper.getCustomerAddress(addressHelperMockData.addressBook.addresses, addressHelperMockData.sfccAddress), addressHelperMockData.sfccAddress));
    });
});
