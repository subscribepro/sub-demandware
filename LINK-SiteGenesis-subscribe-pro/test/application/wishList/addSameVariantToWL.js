'use strict';

import {assert} from 'chai';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as wishListPage from '../pageObjects/wishList';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import {config} from '../webdriver/wdio.conf';

/*
Verify:
    When adding the same product variant twice to a Wish List, the expected behavior
    is the action would result in a redirect to the wish list page without
    adding the same variation product again.
     1. Navigate to Wish List
     2. Login
     3. Chose the product variant and add it to wishlist
     4. Add the same variation product again
     expected: the correct product variant only displayed once in wish list
               The desired quantity should be 1
 */

describe('Cart - addSameVariantToWishList', () => {
    let variant;
    let variantId = '701642841241';
    let expectedDesiredQty = 1;
    const login = config.userEmail;

    before(() => {
        return testData.load()
            .then(() => {
                variant = testData.getProductById(variantId);
            })
            .then(() => wishListPage.navigateTo())
            .then(() => loginForm.loginAs(login))
            .then(() => browser.url(variant.getUrlResourcePath()))
            .then(() => productDetailPage.clickAddToWishListButton())
            .then(() => browser.url(variant.getUrlResourcePath()))
            .then(() => productDetailPage.clickAddToWishListButton())
    });

    after(() =>
        wishListPage.emptyWishList()
            .then(() => navHeader.logout())
    );

    it('should only display one row', () =>
        wishListPage
            .getItemList()
            .then(rows => assert.equal(1, rows.value.length))
    );

    it('should have the correct variant ID', () =>
        wishListPage
            .getItemIdByRow(1)
            .then(Id => assert.equal(Id, variantId))
    );

    it('should have the desired quantity of 1', () =>
        wishListPage
            .getDesiredQuantityByRow(1)
            .then(quantity => assert.equal(quantity, expectedDesiredQty))
    );

});
