'use strict';

import {assert} from 'chai';
import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as Resource from '../../mocks/dw/web/Resource';
import {config} from '../webdriver/wdio.conf';


//TODO: this test will be localized once the string is translated
describe('CSRF Protection - Add Coupon at checkout', () => {
    if (config.coverage !== 'regression') {
        return;
    }
    const couponedProductId = '682875540326';
    let variant;

    before(() => {
        return testData.load()
            .then(() => {
                variant = testData.getProductById(couponedProductId);
                return browser.url(variant.getUrlResourcePath());
            })
            .then(() => productDetailPage.clickAddToCartButton())
    });

    before(() => cartPage.navigateTo());

    it('should get a CSRF token mismatch message', () => {
        let csrfErrorMessage = Resource.msgf('global.csrf.failed.heading', 'locale', null);
        return browser.execute(() => {
            const selector = '[name = csrf_token]';
            return document.querySelector(selector).value = '1234fgdhej'
        })
            .click(cartPage.BTN_ADD_COUPON)
            .getText('h1')
            .then(displayText => assert.equal(displayText, csrfErrorMessage));
    })
})
