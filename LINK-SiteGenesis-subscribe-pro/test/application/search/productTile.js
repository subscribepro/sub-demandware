'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as search from '../pageObjects/search';
import * as testData from '../pageObjects/testData/main';

describe('Search Results - Product Tile', () => {
    const categoryPath = '/mens/clothing/dress%20shirts/';

    // Mens Clothing > Dress Shirts > Modern Dress Shirt
    const productIdSinglePrice = '74974310';

    // Mens Clothing > Dress Shirts > Modern Striped Dress Shirt
    const productIdPriceRange = '69309284';

    // Mens Clothing > Dress Shirts > No-Iron Textured Dress Shirt
    const productIdListAndSalePrice = '25604455';

    let displayPrice;
    const locale = config.locale;

    before(() => testData.load()
        .then(() => browser.url(categoryPath)
            .waitForVisible(search.PRODUCTGRID_CONTAINER)
        )
    );

    it('should display a single list price if a product has no sales prices and all variants prices are the same', () => {
        return search.getProductTilePricingByPid(productIdSinglePrice)
            .then(price => displayPrice = price)
            .then(() => {
                const expectedPrice = testData.getPricesByProductId(productIdSinglePrice, locale);
                return assert.equal(displayPrice, expectedPrice.list);
            });
    });

    it('should display a price range if a product has no sales prices and variants prices span a range', () => {
        return search.getProductTilePricingByPid(productIdPriceRange)
            .then(price => displayPrice = price)
            .then(() => {
                const expectedPrice = testData.getPricesByProductId(productIdPriceRange, locale);
                return assert.equal(displayPrice, `${expectedPrice.sale} - ${expectedPrice.list}`);
            });
    });

    it('should display a normal sale price with the list price struck out when a product has both', () => {
        const productTile = 'div[data-itemid="' + productIdListAndSalePrice + '"]';
        const expectedPrice = testData.getPricesByProductId(productIdListAndSalePrice, locale);
        const expectedListPrice = expectedPrice.list;
        const expectedSalePrice = expectedPrice.sale;

        return browser.getText(productTile + ' ' + search.PRICE_LIST)
            .then(displayedListPrice => assert.equal(displayedListPrice, expectedListPrice))
            .then(() => browser.getText(productTile + ' ' + search.PRICE_SALE))
            .then(displayedSalePrice => assert.equal(displayedSalePrice, expectedSalePrice));
    });
});
