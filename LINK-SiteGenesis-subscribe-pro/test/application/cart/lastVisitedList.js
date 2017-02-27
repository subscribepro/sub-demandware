'use strict';

import {assert} from 'chai';
import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import {config} from '../webdriver/wdio.conf';

/*
 Verify RAP-4876:
 - Add a product to Cart
 - navigate to any PDP
 - go back to the Cart
 - verify the lastVisitedList contains the product just visited
 */

const locale = config.locale;

describe('Cart - LastVisitedList', () => {
    const productVariantId1 = '061492273693';

    before(() => {
        return testData.load()
            .then(() => {
                const productVariant1 = testData.getProductById(productVariantId1);
                return browser.url(productVariant1.getUrlResourcePath());
            })
            .then(() => productDetailPage.clickAddToCartButton())
    });

    after(() =>
        cartPage.emptyCart()
    );

    it('should see the product variant in the LastVisitedList', () => {
        const productVariantId2 = '701643843732';
        const productVariant2 = testData.getProductById(productVariantId2);
        const expectedProductPrice = testData.getPricesByProductId(productVariantId2, locale);
        const expectedProduct = productVariant2.getDisplayName(locale);
        const expectedMediumImage = testData.getProductById(productVariantId2).master.getImage('medium');

        return browser.url(productVariant2.getUrlResourcePath())
            .then(() => cartPage.navigateTo())
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_NAMES))
            .then(lastVisitLists => assert.equal(lastVisitLists[0], expectedProduct, 'displayName should be ' + expectedProduct))
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_PRICES))
            .then(actualPrice => assert.equal(actualPrice[0], expectedProductPrice.list), 'product price should be ' + expectedProductPrice)
            .then(() => browser.getAttribute(cartPage.LAST_VISITED_ITEM_IMAGES, 'src'))
            .then(imgSrc => assert.isTrue(imgSrc[0].endsWith(expectedMediumImage), 'product image should be ' + expectedMediumImage))
    })

    it('should see the product bundle in the LastVisitedList', () => {
        const productBundleId = 'womens-jewelry-bundle';
        const productBundle = testData.getProductById(productBundleId);
        const expectedProduct = productBundle.getLocalizedProperty('displayName', locale);
        const expectedBundlePrice = testData.getPricesByProductId(productBundleId, locale);
        const expectedMediumImage = productBundle.getImage('medium');

        return browser.url(productBundle.getUrlResourcePath())
            .then(() => cartPage.navigateTo())
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_NAMES))
            .then(lastVisitLists => assert.equal(lastVisitLists[0], expectedProduct, 'displayName should be ' + expectedProduct))
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_PRICES))
            .then(actualPrice => assert.equal(actualPrice[0], expectedBundlePrice, 'product bundle price should be ' + expectedBundlePrice))
            .then(() => browser.getAttribute(cartPage.LAST_VISITED_ITEM_IMAGES, 'src'))
            .then(imgSrc => assert.isTrue(imgSrc[0].endsWith(expectedMediumImage),'product image should be '+expectedMediumImage))
    })

    it('should see the product Set in the lastVisitedList', () => {
        const productSetId = 'winter-look';
        const productSet = testData.getProductById(productSetId);
        const expectedProduct = productSet.getLocalizedProperty('displayName', locale);
        const expectedMediumImage = productSet.getImage('medium');

        return browser.url(productSet.getUrlResourcePath())
            .then(() => cartPage.navigateTo())
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_NAMES))
            .then(lastVisitedLists => assert.equal(lastVisitedLists[0], expectedProduct, 'displayName should be ' + expectedProduct))
            .then(() => browser.getAttribute(cartPage.LAST_VISITED_ITEM_IMAGES, 'src'))
            .then(imgSrc => assert.isTrue(imgSrc[0].endsWith(expectedMediumImage),'product image should be '+expectedMediumImage))
    })

    it('should see the single product in the lastVisitedList', () => {
        const productSingleId = '013742002485';
        const productSingle = testData.getProductById(productSingleId);
        const expectedProduct = productSingle.getDisplayName(locale);
        const expectedPrice = testData.getPricesByProductId(productSingleId, locale);
        const expectedMediumImage = productSingle.master.getImage('medium');

        return browser.url(productSingle.getUrlResourcePath())
            .then(() => cartPage.navigateTo())
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_NAMES))
            .then(lastVisitedLists => assert.equal(lastVisitedLists[0], expectedProduct, 'displayiName should be '+ expectedProduct))
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_PRICES))
            .then(actualPrice => assert.equal(actualPrice[0], expectedPrice.sale, 'product single price should be ' + expectedPrice.sale))
            .then(() => browser.getAttribute(cartPage.LAST_VISITED_ITEM_IMAGES, 'src'))
            .then(imgSrc => assert.isTrue(imgSrc[0].endsWith(expectedMediumImage),'product image should be '+expectedMediumImage))
    })

    it('should see the master product in the lastVisitedList', () => {
        const productMasterId = '25604455';
        const productMaster = testData.getProductById(productMasterId);
        const expectedProduct = productMaster.getLocalizedProperty('displayName', locale);
        const expectedPrice = testData.getPricesByProductId(productMasterId, locale);
        const expectedMediumImage = productMaster.getImage('medium');

        return browser.url(productMaster.getUrlResourcePath())
            .then(() => cartPage.navigateTo())
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_NAMES))
            .then(lastVisitedLists => assert.equal(lastVisitedLists[0], expectedProduct, 'displayiName should be '+ expectedProduct))
            .then(() => browser.getText(cartPage.LAST_VISITED_ITEM_PRICES))
            .then(actualPrice => assert.equal(actualPrice[0], expectedPrice.sale, 'product single price should be ' + expectedPrice.sale))
            .then(() => browser.getAttribute(cartPage.LAST_VISITED_ITEM_IMAGES, 'src'))
            .then(imgSrc => assert.isTrue(imgSrc[0].endsWith(expectedMediumImage),'product image should be '+expectedMediumImage))
    })
})


