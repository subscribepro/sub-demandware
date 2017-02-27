'use strict';

import {assert} from 'chai';
import * as testData from '../pageObjects/testData/main';
import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as products from '../pageObjects/testData/products';
import {config} from '../webdriver/wdio.conf';

// This Test will only work for US sites due to the fact that we only have US store locations.

describe('Cart - select store', () => {
    let selectedStoreAddress;
    let storeAddress;
    let catalog;
    let productVariation;
    let resourcePath;
    let locale = config.locale;

    if (locale && locale !== 'x_default') {
        return;
    }
    before(() => {
        return testData.load()
            .then(() => catalog = testData.parsedData.catalog)
            .then(() => testData.getProductById('42946931'))
            .then(productMaster => {
                let variantIds;
                let variantSelection = new Map();

                productVariation = productMaster;
                resourcePath = productVariation.getUrlResourcePath();
                variantIds = productVariation.getVariantProductIds();

                let instance = products.getProduct(catalog, variantIds[0]);

                variantSelection.set('resourcePath', resourcePath);
                variantSelection.set('colorIndex', (productVariation.getAttrTypeValueIndex('color', instance.customAttributes.color) + 1));
                variantSelection.set('sizeIndex', (productVariation.getAttrTypeValueIndex('size', instance.customAttributes.size) + 1));

                return productDetailPage.addProductVariationToCart(variantSelection);
            })
            .then(() => cartPage.navigateTo());
    });

    after(() => cartPage.emptyCart());

    it('should click on select store on the cart page to bring up Zip code pop up', () =>
        browser.click(cartPage.SELECT_STORE)
            .waitForVisible(cartPage.ZIP_CODE_POP_UP)
            .isVisible(cartPage.ZIP_CODE_POP_UP)
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should search for stores "near you" by zip code', () =>
        browser.setValue('#user-zip', '04330')
            .click(cartPage.BTN_SEARCH_FOR_STORE)
            .waitForVisible(cartPage.STORE_LIST_CONTAINER)
            .isVisible(cartPage.STORE_LIST_CONTAINER)
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should select a store form the list of available stores', () =>
        browser.click(cartPage.BTN_SELECT_STORE)
            .getText(cartPage.STORE_ADDRESS_TEXT)
            .then(addressText => storeAddress = addressText)
            .then(() => browser.click(cartPage.BTN_SELECT_STORE_CONTINUE))
            .isVisible(cartPage.STORE_LIST_CONTAINER)
            .then(visible => assert.isFalse(visible))
    );

    it('should check that the selected store address is the displayed address on the cart page', () =>
        browser.waitUntil(() =>
            browser.getText(cartPage.SELECTED_STORE_ADDRESS)
                .then(
                    text => selectedStoreAddress = text,
                    () => false
                )
        )
            .then(() => assert.equal(selectedStoreAddress, storeAddress))
    );

    it('should click select store and bring up a list of stores "near me"', () =>
        browser.click(cartPage.SELECT_STORE)
            .waitForVisible(cartPage.STORE_LIST_CONTAINER)
            .isVisible(cartPage.STORE_LIST_CONTAINER)
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should click "change location" and display the zip code pop up then enter a new zip code and select a new store', () =>
        browser.click(cartPage.CHANGE_LOCATION)
            .waitForVisible(cartPage.ZIP_CODE_POP_UP)
            .setValue('#user-zip', '01803')
            .click(cartPage.BTN_SEARCH_FOR_STORE)
            .waitForVisible(cartPage.STORE_LIST_CONTAINER)
            .click(cartPage.BTN_SELECT_STORE)
            .getText(cartPage.STORE_ADDRESS_TEXT)
            .then(addressText => storeAddress = addressText)
            .then(() => browser.click(cartPage.BTN_SELECT_STORE_CONTINUE))
            .isVisible(cartPage.STORE_LIST_CONTAINER)
            .then(visible => assert.isFalse(visible))
    );

    it('should check that the store address displayed has changed to the new selected store address', () =>
        browser.waitUntil(() =>
            browser.getText(cartPage.SELECTED_STORE_ADDRESS)
                .then(
                    text => selectedStoreAddress = text,
                    () => false
                )
            )
            .then(() => assert.equal(selectedStoreAddress, storeAddress))
    );
});
