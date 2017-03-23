'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';

import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as Resource from '../../mocks/dw/web/Resource';
import * as pricingHelpers from '../pageObjects/helpers/pricing';

describe('Cart - Various Coupon Scenarios', () => {
    const locale = config.locale;
    const couponedProductId = '682875540326';
    let variant;
    let unitPrices;

    before(() => {
        return testData.load()
            .then(() => {
                unitPrices = testData.getPricesByProductId(couponedProductId, locale);
                variant = testData.getProductById(couponedProductId);
                return browser.url(variant.getUrlResourcePath());
            })
            .then(() => productDetailPage.clickAddToCartButton())
    });

    beforeEach(() => cartPage.navigateTo());

    after(() => {
        return cartPage
            .removeItemByRow(1)
            .then(() => cartPage.verifyCartEmpty())
    })

    it('should verify that invalid coupons are reported', () => {
        let badCoupon = 'gobbledy_gook';
        let badCouponMessage = Resource.msgf('cart.NO_APPLICABLE_PROMOTION', 'checkout', null, badCoupon);
        return browser.setValue(cartPage.COUPON_CODE, badCoupon)
            .click(cartPage.BTN_ADD_COUPON)
            .waitForVisible(cartPage.COUPON_ERROR)
            .getText(cartPage.COUPON_ERROR)
            .then(displayText => assert.equal(displayText, badCouponMessage));
    });

    it('should verify that valid but unassigned coupons are reported', () => {
        let invalidCoupon = 'shipping';
        let invalidCouponMessage = Resource.msgf('cart.NO_APPLICABLE_PROMOTION', 'checkout', null, invalidCoupon);
        return browser.setValue(cartPage.COUPON_CODE, invalidCoupon)
            .click(cartPage.BTN_ADD_COUPON)
            .waitForVisible(cartPage.COUPON_ERROR)
            .getText(cartPage.COUPON_ERROR)
            .then(displayText => assert.equal(displayText, invalidCouponMessage));
    });

    it('should verify that a valid coupon has the correct message', () => {
        let goodCoupon = '5ties';
        let goodCouponMessage = Resource.msgf('cart.couponcode', 'checkout', null);
        return browser.setValue(cartPage.COUPON_CODE, goodCoupon)
            .click(cartPage.BTN_ADD_COUPON)
            .waitForVisible(cartPage.COUPON_APPLIED_LABEL)
            .getText(cartPage.COUPON_APPLIED_LABEL)
            .then(displayText => assert.equal(displayText, goodCouponMessage));
    });

    it('should verify the coupon correctly adjusts the price', () =>
        cartPage
            .getSelectPriceByRow(1, '.price-adjusted-total')
            .then(subTotal => {
                const discountAmount = 5.00;
                var salePriceValue = pricingHelpers.getCurrencyValue(unitPrices.sale, locale) - discountAmount;
                var subTotalValue = pricingHelpers.getCurrencyValue(subTotal, locale);
                assert.equal(subTotalValue, salePriceValue.toFixed(2));
            })
    );

    it('should remove the coupon from the cart', () => {
        return browser.click(cartPage.BTN_REMOVE_COUPON)
            .waitForVisible(cartPage.ORDER_SUBTOTAL)
            .getText(cartPage.ORDER_SUBTOTAL)
            .then(updatedItemSubTotal =>
                assert.equal(updatedItemSubTotal, unitPrices.sale));
    });

});
