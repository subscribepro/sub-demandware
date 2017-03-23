'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as pricingHelpers from '../pageObjects/helpers/pricing';

/*
 - Verify
 1. The first line item is the product bundle itself
 2. each product within the bundle displays as a line item in the next 3 row
 and they are indented
 3. The quantity listed for a product within a bundle is view only.
 4. A graphic displays for the bundle, which has an SKU, and for each of the
 products within the bundle.
 5. Price is only shown at the top level, not by each individual line item.
 6. Quantity is editable only at the top level -- not at the level of each
 item within the bundle.
 7. Updating the quantity of the bundle properly updates the quantity by each
 individual line item.
 8. The order of bundled product items presented in the cart is as defined in
 Business Manager.
 (---)
 */

describe('Cart - addProductBundle', () => {
    let locale = config.locale;
    let productBundleId = 'womens-jewelry-bundle';
    let productBundle;
    let bundledProducts = [];
    let expectedUnitPrice;


    before(() => {
        return testData.load()
            .then(() => {
                expectedUnitPrice = testData.getPricesByProductId(productBundleId, locale);
                productBundle = testData.getProductById(productBundleId);
                bundledProducts = productBundle.getProductIds();
            })
    });

    function verifyProductBundle (rowNumber, bundledQuantity) {
        let numberOfRowsForBundle = bundledProducts.length + 1;   // number of products in the bundle + the bundle itself

        let salePriceValue = pricingHelpers.getCurrencyValue(expectedUnitPrice, locale);
        let expectedItemTotalPrice = salePriceValue * bundledQuantity;
        let formattedExpectedItemSubTotal = pricingHelpers.getFormattedPrice(expectedItemTotalPrice.toString(), locale);

        return cartPage
            .getItemList()
            .then(rows => assert.equal(rows.value.length, numberOfRowsForBundle,'should display the correct number of rows'))
            .then(() => {
                let bundleImageSmall = productBundle.getImage('small');

                return cartPage
                    .getItemImageSrcAttrByRow(rowNumber)
                    .then(imgSrc => {
                        assert.isTrue(imgSrc.endsWith(bundleImageSmall),
                            'should display the correct product bundle image on row ' + rowNumber)});
            })
            .then(() => {
                let expectedDisplayName = productBundle.getLocalizedProperty('displayName', locale);

                return cartPage
                    .getItemNameByRow(rowNumber)
                    .then(name => {
                        assert.equal(name, expectedDisplayName,
                            'should display the correct product bundle name on row ' + rowNumber);
                    })
            })
            .then(() => {
                return cartPage
                    .getItemSkuValueByRow(rowNumber)
                    .then(sku => assert.equal(sku, productBundleId, 'should display the correct product bundle sku value on row ' + rowNumber))
            })
            .then(() => {
                return cartPage.getQuantityByRow(rowNumber)
                    .then(quantity => {
                        assert.equal(quantity, bundledQuantity.toString(), 'should display the correct product bundle quantity on row ' + rowNumber);
                    })
            })
            .then(() => {
                return cartPage
                    .getSelectPriceByRow(rowNumber, '.item-price .price-sales')
                    .then(itemPrice =>
                        assert.equal(itemPrice, expectedUnitPrice, 'should have the correct product bundle item price on row ' + rowNumber)
                    )
            })
            .then(() => {
                return cartPage
                    .getPriceByRow(rowNumber)
                    .then(subTotal =>
                        assert.equal(subTotal, formattedExpectedItemSubTotal, 'should have the correct product bundle sub-total on row ' + rowNumber)
                    )
            })
    }

    function verifyBundlesProductItem (rowNumber, productId, bundledQuantity) {
        return cartPage
            .getBundledItemImageByRow(rowNumber)
            .then(bundledItemImage => assert.equal(bundledItemImage, '',
                'should indent the bundled product item on row ' + rowNumber))
            .then(() => {
                let bundledProd = testData.getProductById(productId);
                let bundleMaster = testData.getProductById(bundledProd.master.id);
                let firstAttrType = bundleMaster.getAttrTypes()[0];
                let firstAttrValue = bundledProd.customAttributes[firstAttrType];
                let bundleImageSmall = bundleMaster.getImage('small', firstAttrValue);

                return cartPage
                    .getBundledItemDetailsImageSrcAttrByRow(rowNumber)
                    .then(imgSrc => {
                        assert.isTrue(imgSrc.endsWith(bundleImageSmall),
                            'should display the correct bundled product item image on row ' + rowNumber)});
            })
            .then(() => {
                let expectedBundledItem = testData.getProductById(productId);
                let expectedBundleMaster = testData.getProductById(expectedBundledItem.master.id);
                let expectedDisplayName = expectedBundleMaster.getLocalizedProperty('displayName', locale);

                return cartPage
                    .getBundledItemNameByRow(rowNumber)
                    .then(bundledItemName => {
                        assert.equal(bundledItemName, expectedDisplayName,
                            'should display the correct bundled product item name  on row ' + rowNumber)});
            })
            .then(() => {
                return cartPage
                    .getBundledItemNumberByRow(rowNumber)
                    .then(bundledItemNumber => {
                        assert.equal(bundledItemNumber, productId,
                            'should display the correct bundled product item ID on row ' + rowNumber)});
            })
            .then(() => {
                return cartPage
                    .getBundledItemQuantityByRow(rowNumber)
                    .then(bundledItemQuantity => {
                        assert.equal(bundledItemQuantity, bundledQuantity.toString(),
                            'should display the correct bundled product item quantity on row ' + rowNumber)});
            })
            .then(() => {
                return cartPage
                    .getBundledItemQuantityTagNameByRow(rowNumber)
                    .then(tag => {
                        assert.notEqual(tag, 'input',
                            'should display bundled product item quantity as readonly field on row ' + rowNumber)});
            })
            .then(() => {
                return cartPage
                    .getBundledItemUnitPriceByRow(rowNumber)
                    .then(bundleUnitPrice => {
                        assert.equal(bundleUnitPrice, '',
                            'should Not display unit price of bundled product item on row ' + rowNumber)});
            })
            .then(() => {
                return cartPage
                    .getBundledItemTotalPriceByRow(rowNumber)
                    .then(bundleTotalPrice => {
                        assert.equal(bundleTotalPrice, '',
                            'should Not display total price of bundled product item on row ' + rowNumber)});
            })
    }

    it('should add 1 product bundle to cart', () => {
        return browser.url(productBundle.getUrlResourcePath())
            .then(() => productDetailPage.clickAddToCartButton())
            .then(() => cartPage.navigateTo())
            .then(() => verifyProductBundle(1, 1))
            .then(() => verifyBundlesProductItem(2, bundledProducts[0], 1))
            .then(() => verifyBundlesProductItem(3, bundledProducts[1], 1))
            .then(() => verifyBundlesProductItem(4, bundledProducts[2], 1))
    });

    it('should update product bundle quantity to 2', () => {
        return cartPage
            .updateQuantityByRow(1, 2)
            .then(quantity => {
                assert.equal(quantity, 2, 'Expected the product bundle quantity updated to 2')
            })
            .then(() => verifyProductBundle (1, 2))
            .then(() => verifyBundlesProductItem(2, bundledProducts[0], 2))
            .then(() => verifyBundlesProductItem(3, bundledProducts[1], 2))
            .then(() => verifyBundlesProductItem(4, bundledProducts[2], 2))
    });

    it('should remove product from cart', () =>
        cartPage
            .removeItemByRow(1)
            .then(() => cartPage.verifyCartEmpty())
            .then(empty => assert.ok(empty))
    );

});
