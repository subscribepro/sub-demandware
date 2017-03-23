'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');

/**
 * Mocks
 */
var proxyquire = require('proxyquire').noCallThru();
var AbstractModel = {
    extend: function () {
        return function (inputParam) {
            return {orderNo: inputParam};
        };
    }
};

var mockPath = '../../../../mocks/';
var Logger = require(mockPath + 'dw/system/Logger');
var Order = require(mockPath + 'dw/order/Order');
var OrderMgr = require(mockPath + 'dw/order/OrderMgr');
var Resource = require(mockPath + 'dw/web/Resource');
var Status = require(mockPath + 'dw/system/Status');
var Transaction = require(mockPath + 'dw/system/Transaction');

var cartridgePath = '../../../../../app_storefront_controllers/';

/**
 * Spies
 */
var spyAbstractModel = sinon.spy(AbstractModel, 'extend');
var spyOrderMgr = sinon.spy(OrderMgr, 'getOrder');

// Mock out module dependencies
var OrderModel = proxyquire(cartridgePath + 'cartridge/scripts/models/OrderModel.js', {
    './AbstractModel': AbstractModel,
    './EmailModel': {},
    './GiftCertificateModel': {},
    'dw/system/Logger': Logger,
    'dw/order/Order': Order,
    'dw/order/OrderMgr': OrderMgr,
    'dw/web/Resource': Resource,
    'dw/system/Status': Status,
    'dw/system/Transaction': Transaction
});


describe('Order model', function () {

    it('should extend the AbstractModel class', function () {
        sinon.assert.calledOnce(spyAbstractModel);
    });

    describe('.get()', function () {

        it('should call getOrder when given a string parameter', function () {
            spyOrderMgr.reset();

            OrderModel.get('some param');

            sinon.assert.calledOnce(spyOrderMgr);
        });

        it('should not call getOrder when not given a string parameter', function () {
            spyOrderMgr.reset();

            OrderModel.get();

            sinon.assert.notCalled(spyOrderMgr);
        });

        it('should instantiate an Order with an string when given a string', function () {
            var order = OrderModel.get('sunny sky');
            expect(order.orderNo).to.equal('sunny sky');
        });

        it('should instantiate an Order with an object when given an object', function () {
            var order = OrderModel.get({nice: true});
            expect(order.orderNo).to.deep.equal({nice: true});
        });

        it('should instantiate an Order with null when given null', function () {
            var order = OrderModel.get();
            expect(order.orderNo).to.be.null;
        });
    });
});
