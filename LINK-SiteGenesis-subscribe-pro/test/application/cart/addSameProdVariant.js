'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as pricingHelpers from '../pageObjects/helpers/pricing';

describe('Cart - addSameProdVariant', () => {
    let locale = config.locale;
    let variant;
    let variantId = '708141676190';
    let expectedQty = 2;
    let lineItemQuantity;
    let unitPrices;


    before(() => {
        return testData.load()
            .then(() => {
                unitPrices = testData.getPricesByProductId(variantId, locale);
                variant = testData.getProductById(variantId);
                return browser.url(variant.getUrlResourcePath());
            })
            // This test verifies the expected behavior when adding the same product twice to a Cart.
            // It should increment the quantity by one and calculate the correct subtotal.
            .then(() => productDetailPage.clickAddToCartButton())
            .then(() => productDetailPage.clickAddToCartButton())
            .then(() => cartPage.navigateTo());
    });

    it('should display the correct number of rows', () =>
        cartPage
            .getItemList()
            .then(rows => assert.equal(1, rows.value.length))
    );

    it('should display the correct quantity in cart', () =>
        cartPage.getQuantityByRow(1)
            .then(quantity => {
                lineItemQuantity = quantity;
                assert.equal(lineItemQuantity, expectedQty.toString());
            })
    );

    it('should have the correct item price in cart', () =>
        cartPage
            .getSelectPriceByRow(1, '.price-promotion .price-sales')
            .then(itemPrice =>
                assert.equal(itemPrice, unitPrices.sale)
            )
    );

    it('should have the correct sub-total in cart', () =>
         cartPage
            .getPriceByRow(1)
            .then(subTotal => {
                var salePriceValue = pricingHelpers.getCurrencyValue(unitPrices.sale, locale);
                var expectedSubTotal = salePriceValue * expectedQty;
                var formattedExpectedSubTotal = pricingHelpers.getFormattedPrice(expectedSubTotal.toString(), locale);
                assert.equal(subTotal, formattedExpectedSubTotal);
            })
    );

    it('should remove product from cart', () =>
        cartPage
            .removeItemByRow(1)
            .then(() => cartPage.verifyCartEmpty())
            .then(empty => assert.ok(empty))
    );

});
