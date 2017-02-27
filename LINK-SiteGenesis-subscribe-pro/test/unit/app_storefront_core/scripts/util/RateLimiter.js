'use strict';

import {assert} from 'chai';
import proxyquireModule from 'proxyquire';

let proxyquire = proxyquireModule.noCallThru();
let iterations = 7;
let RateLimiter = proxyquire('../../../../../app_storefront_core/cartridge/scripts/util/RateLimiter.js', {
    'dw/system/Site': {
        getCurrent: function () {
            return {
                getCustomPreferenceValue: function () {
                    return iterations;
                }
            };
        }
    },
    'dw/system/Logger': {
        error: function () {}
    }
});

global.session = {
    privacy: {
        showCaptcha: null,
        foo: null
    }
};

describe('RateLimiter', () => {

    describe('isOverThreshold', () => {

        it('should return false the number of times equal to the threshold', () => {
            var result;

            for (var i = 0; i < iterations; i++) {
                result = RateLimiter.isOverThreshold('foo');
                assert.isFalse(result);
            }
        });

        it('should return true once the threshold has been exceeded', () => {
            let result = RateLimiter.isOverThreshold('foo');
            assert.isTrue(result);
        });

    });

    describe('showCaptcha', () => {
        it('should set session.privacy.showCaptcha to true', () => {
            assert.isNull(session.privacy.showCaptcha);

            RateLimiter.showCaptcha();
            assert.isTrue(session.privacy.showCaptcha);
        });
    });

    describe('hideCaptcha', () => {
        it('should set session.privacy.showCaptcha to null', () => {
            assert.isTrue(session.privacy.showCaptcha);

            RateLimiter.hideCaptcha();
            assert.isFalse(session.privacy.showCaptcha);
        });
    });
});
