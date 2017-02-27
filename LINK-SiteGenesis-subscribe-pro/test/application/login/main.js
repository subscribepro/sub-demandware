'use strict';

import {assert} from 'chai';

import * as loginPage from '../pageObjects/loginPage';
import * as testData from '../pageObjects/testData/main';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as productDetailPage from '../pageObjects/productDetail';
import * as Resource from '../../mocks/dw/web/Resource';
import * as checkoutPage from '../pageObjects/checkout';
import {config} from '../webdriver/wdio.conf';

function addProductVariationMasterToCart () {
    let product = new Map();
    product.set('resourcePath', testData.getProductVariationMaster().getUrlResourcePath());
    product.set('colorIndex', 1);
    product.set('sizeIndex', 2);
    product.set('widthIndex', 1);

    return productDetailPage.addProductVariationToCart(product);
}

describe('Login Page', () => {
    let oauthLoginErrorMsg = Resource.msg('account.login.logininclude.oauthloginerror', 'account', null);

    before(() => testData.load());

    beforeEach(() => loginPage.navigateTo()
        .then(() => browser.waitForVisible(loginPage.LOGIN_BOX))
    );

    after(() => navHeader.logout());

    it('should get error message for incorrect login credentials', () => {
        let errorMessage = Resource.msg('account.login.logininclude.loginerror', 'account', null);
        return browser.setValue(loginForm.INPUT_EMAIL, 'incorrectEmail@demandware.com')
            .setValue(loginForm.INPUT_PASSWORD, 'badPassword')
            .click(loginForm.BTN_LOGIN)
            .waitForExist(loginPage.ERROR_MSG)
            .getText(loginPage.ERROR_MSG)
            .then(displayText => assert.equal(displayText, errorMessage));
    });

    it('should get an error message when clicking on googlePlus oauthLogin', () =>
        browser.click('#GooglePlus')
            .waitForExist(loginPage.ERROR_MSG)
            .getText(loginPage.ERROR_MSG)
            .then(displayText => assert.equal(displayText, oauthLoginErrorMsg))
    );

    it('should get an error message when clicking on googlePlus oauthLogin (Wish List login)', () =>

        browser.click(loginPage.WISHLIST_FOOTER_LINK)
            .waitForVisible(loginPage.LOGIN_BOX)
            .click('#GooglePlus')
            .waitForExist(loginPage.ERROR_MSG)
            .getText(loginPage.ERROR_MSG)
            .then(displayText => assert.equal(displayText, oauthLoginErrorMsg))
    );

    it('should get an error message when clicking on googlePlus oauthLogin (Gift Registry login)', () =>

        browser.click(loginPage.GIFTREGISTRY_FOOTER_LINK)
            .waitForVisible(loginPage.LOGIN_BOX)
            .click('#GooglePlus')
            .waitForExist(loginPage.ERROR_MSG)
            .getText(loginPage.ERROR_MSG)
            .then(displayText => assert.equal(displayText, oauthLoginErrorMsg))
    );

    it('should get an error message when clicking on googlePlus oauthLogin (Checkout login)', () =>

        addProductVariationMasterToCart()
        .then(() => checkoutPage.navigateTo())
        .click('#GooglePlus')
        .waitForExist(loginPage.ERROR_MSG)
        .getText(loginPage.ERROR_MSG)
        .then(displayText => assert.equal(displayText, oauthLoginErrorMsg))
    );

    it('should login using login form', () =>
        loginForm.loginAs(config.userEmail)
            .then(() => browser.waitForExist('.account-options'))
            .then(() => browser.isExisting('.account-options'))
            .then(doesExist => assert.isTrue(doesExist))
    );
});
