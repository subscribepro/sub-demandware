'use strict';

var assert = require('assert');
var util = require('../../../../app_storefront_core/cartridge/js/util');

describe('Utils', function () {
    describe('append param to url', function () {
        it('should append first param to url', function () {
            assert.equal(util.appendParamToURL('http://example.com', 'color', 'blue'),
                'http://example.com?color=blue');
        });
        it('should append second param to url', function () {
            assert.equal(util.appendParamToURL('http://example.com?color=red', 'size', 'large'),
                'http://example.com?color=red&size=large');
        });
    });
    describe('remove param from url', function () {
        it('should remove param and its value from url', function () {
            assert.equal(util.removeParamFromURL('http://example.com?color=red&size=large', 'size'),
                'http://example.com?color=red');
        });

        it('should remove param and its value from url with hash', function () {
            assert.equal(util.removeParamFromURL('http://example.com?color=red&size=large#name=dw', 'size'),
                'http://example.com?color=red#name=dw');
        });

        it('should not modify url that does not have any params', function () {
            assert.equal(util.removeParamFromURL('http://example.com', 'size'),
                'http://example.com');
        });

        it('should not modify url that does not have the desired param', function () {
            assert.equal(util.removeParamFromURL('http://example.com?color=red&size=large#name=dw', 'width'),
                'http://example.com?color=red&size=large#name=dw');
        });
    });
});
