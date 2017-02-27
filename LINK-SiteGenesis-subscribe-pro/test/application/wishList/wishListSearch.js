'use strict';

import {assert} from 'chai';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as wishListPage from '../pageObjects/wishList';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as Resource from '../../mocks/dw/web/Resource';
import {config} from '../webdriver/wdio.conf';

/*
Verify:
    Search for wish list.
    - As an anonymous user, search on wish list of a registered user should
      result in the wish list returned if the list is public. If the list is
      private it should not be returned.
 */

describe('Wish List - Search for wish list as an anonymous user', () => {
    let variant;
    let variantId = '701644349929';
    let privacyButton = wishListPage.BTN_TOGGLE_PRIVACY;
    const login = config.userEmail;
    let customer;

    before(() => {
        return testData.load()
            .then(() => {
                variant = testData.getProductById(variantId);
                customer = testData.getCustomerByLogin(login);
            })
            .then(() => wishListPage.navigateTo())
            .then(() => loginForm.loginAs(login))
            .then(() => browser.url(variant.getUrlResourcePath()))
            .then(() => productDetailPage.clickAddToWishListButton())
            .then(() => browser.waitForVisible(privacyButton))
            .then(() => navHeader.logout())

    });

    after(() => wishListPage.navigateTo()
        .then(() => loginForm.loginAs(login))
        .then(() => wishListPage.emptyWishList())
        .then(() => navHeader.logout())
    );

    describe('Landing page: Search for public wish list as anonymous user.', () => {

        // Login and make wish list public
        before(() => {
            return wishListPage.navigateTo()
                .then(() => loginForm.loginAs(login))
                .then(() => browser.waitForVisible(privacyButton))
                .then(() => wishListPage.publishList())
                .then(() => navHeader.logout())
        });

        it('Should return list on search with matching Lastname and Firstname.', () =>
            wishListPage.navigateTo()
                .then(() => browser.waitForVisible(wishListPage.FRM_WISH_LIST_SEARCH_LAST_NAME))
                .then(() => browser.setValue(wishListPage.FRM_WISH_LIST_SEARCH_LAST_NAME, customer.lastName))
                .then(() => browser.setValue(wishListPage.FRM_WISH_LIST_SEARCH_FIRST_NAME, customer.firstName))
                .then(() => browser.click(wishListPage.BTN_WISH_LIST_SEARCH))
                .then(() => browser.waitForVisible(wishListPage.WISHLIST_ITEMS))
                .then(() => wishListPage.getItemList())
                .then(rows => assert.equal(2, rows.value.length))
                .then(() => browser.getText(' .item-list .last-name'))
                .then(lastName => assert.equal(customer.lastName, lastName))
                .then(() => browser.getText(' .item-list .first-name'))
                .then(firstName => assert.equal(customer.firstName, firstName))
                .then(() => browser.getText(' .item-list .view > a', 'href > span'))
                .then(viewStr =>  {
                    let expectedStr = Resource.msgf('wishlistresult.view', 'account', null);
                    assert.equal(expectedStr, viewStr);
                })
        );

        it('Should return list on search with email address.', () =>
            wishListPage.navigateTo()
                .then(() => browser.waitForVisible(wishListPage.FRM_WISH_LIST_SEARCH_LAST_NAME))
                .then(() => browser.setValue(wishListPage.FRM_WISH_LIST_SEARCH_EMAIL, login))
                .then(() => browser.click(wishListPage.BTN_WISH_LIST_SEARCH))
                .then(() => browser.waitForVisible(wishListPage.WISHLIST_ITEMS))
                .then(() => wishListPage.getItemList())
                .then(rows => assert.equal(2, rows.value.length))
                .then(() => browser.getText(' .item-list .last-name'))
                .then(lastName => assert.equal(customer.lastName, lastName))
                .then(() => browser.getText(' .item-list .first-name'))
                .then(firstName => assert.equal(customer.firstName, firstName))
                .then(() => browser.getText(' .item-list .view > a', 'href > span'))
                .then(viewStr =>  {
                    let expectedStr = Resource.msgf('wishlistresult.view', 'account', null);
                    assert.equal(expectedStr, viewStr);
                })
        );

    });

    describe('Landing page: Search for private wish list as anonymous user.', () => {

        // Login and make wish list private
        before(() => {
            return wishListPage.navigateTo()
                .then(() => loginForm.loginAs(login))
                .then(() => browser.waitForVisible(privacyButton))
                .then(() => wishListPage.unPublishList())
                .then(() => navHeader.logout())
        });

        it('Should not return private wish list', () =>
             wishListPage.navigateTo()
                .then(() => browser.waitForVisible(wishListPage.FRM_WISH_LIST_SEARCH_LAST_NAME))
                .then(() => browser.setValue(wishListPage.FRM_WISH_LIST_SEARCH_LAST_NAME, customer.lastName))
                .then(() => browser.setValue(wishListPage.FRM_WISH_LIST_SEARCH_FIRST_NAME, customer.firstName))
                .then(() => browser.click(wishListPage.BTN_WISH_LIST_SEARCH))
                .then(() => browser.waitForVisible(wishListPage.BTN_WISH_LIST_SEARCH))
                .then(() => browser.isExisting(wishListPage.WISHLIST_ITEMS))
                .then(doesExist => assert.isFalse(doesExist))

                // Due to bug RAP-5030 on controller, a check for wish list not found message can not be performed here.
        );

    });

});
