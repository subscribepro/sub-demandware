'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as cartPage from '../pageObjects/cart';
import * as common from '../pageObjects/helpers/common';
import * as productDetailPage from '../pageObjects/productDetail';
import * as productQuickViewPage from '../pageObjects/productQuickView';
import * as testData from '../pageObjects/testData/main';
import * as products from '../pageObjects/testData/products';
import * as Resource from '../../mocks/dw/web/Resource';

describe('Cart - Simple', () => {
    let locale = config.locale;
    let catalog;
    let productVariationMaster;
    let resourcePath;
    let itemRow = 1;
    let variant1 = {
        instance: undefined,
        color: {
            index: undefined,
            displayValue: undefined
        },
        size: {
            index: undefined,
            displayValue: undefined
        },
        width: {
            index: undefined,
            displayValue: undefined
        }
    };
    let variant2 = {
        instance: undefined,
        color: {
            index: undefined,
            displayValue: undefined
        },
        size: {
            index: undefined,
            displayValue: undefined
        },
        width: {
            index: undefined,
            displayValue: undefined
        }
    };

    //This price is after updated the product quantity the new total
    let updatedPrice = {
        'x_default': '$149.97',
        'en_GB': '£95.97',
        'fr_FR': '107,97 €',
        'it_IT': '€ 107,97',
        'ja_JP': '¥ 18,084',
        'zh_CN': '¥960.00'
    };

    before(() => {
        return testData.load()
            .then(() => {
                productVariationMaster = testData.getProductVariationMaster();
                return browser.url(productVariationMaster.getUrlResourcePath());
            })
            .then(() => {
                let variantIds;
                let variant1Selection = new Map();
                catalog = testData.parsedData.catalog;
                variantIds = productVariationMaster.getVariantProductIds();

                // No-Iron Textured Dress Shirt (Color: White, Size: 14 1/2, Width: 32/33)
                variant1.instance = products.getProduct(catalog, variantIds[0]);
                // No-Iron Textured Dress Shirt (Color: White, Size: 17 1/2, Width: 34/35)
                variant2.instance = products.getProduct(catalog, variantIds[10]);

                // We must increment the index by 1 for the attribute selectors that use CSS nth-child which is one-based.
                variant1.color.index = productVariationMaster.getAttrTypeValueIndex('color', variant1.instance.customAttributes.color) + 1;
                variant1.size.index = productVariationMaster.getAttrTypeValueIndex('size', variant1.instance.customAttributes.size) + 1;
                variant1.width.index = productVariationMaster.getAttrTypeValueIndex('width', variant1.instance.customAttributes.width) + 1;

                variant1Selection.set('resourcePath', resourcePath);
                variant1Selection.set('colorIndex', variant1.color.index);
                variant1Selection.set('sizeIndex', variant1.size.index);
                variant1Selection.set('widthIndex', variant1.width.index);

                return productDetailPage.addProductVariationToCart(variant1Selection);
            })
            .then(() => cartPage.navigateTo());
    });

    it('should display the correct number of rows', () =>
        cartPage
            .getItemList()
            .then(rows => assert.equal(1, rows.value.length))
    );

    it('should not show availability in two places', () => {
        if (config.coverage !== 'regression') {
            return;
        }
        let availabilityMessage = Resource.msg('global.instock','locale',null);
        return browser.waitForVisible(cartPage.AVAILABILITY_MESSAGE_1)
            .then(() => browser.getText(cartPage.AVAILABILITY_MESSAGE_1))
            .then(value => assert.equal(value,availabilityMessage))
            .then(() => browser.isExisting(cartPage.AVAILABILITY_MESSAGE_2))
            .then(doesExist => assert.isFalse(doesExist))

    });

    it('should display the correct name', () =>
        cartPage
            .getItemNameByRow(1)
            .then(name => assert.equal(name, productVariationMaster.getLocalizedProperty('displayName', locale)))
    );

    it('should display the correct color', () => {
        let expectedColor = productVariationMaster.getLocalizedProperty(`variationAttributes.color.values.${variant1.color.index - 1}.displayValues`, locale);
        return cartPage
            .getItemAttrByRow(1, 'color')
            .then(color => assert.equal(color, expectedColor));
    });

    it('should display the correct size', () => {
        let expectedSize = productVariationMaster.getLocalizedProperty(`variationAttributes.size.values.${variant1.size.index - 1}.displayValues`,locale);
        return cartPage
            .getItemAttrByRow(1, 'size')
            .then(size => assert.equal(size, expectedSize));
    });

    it('should display the correct width', () => {
        let expectedWidth = productVariationMaster.getLocalizedProperty(`variationAttributes.width.values.${variant1.width.index - 1}.displayValues`,locale);
        return cartPage
            .getItemAttrByRow(1, 'width')
            .then(size => assert.equal(size, expectedWidth));
    });

    it('should update attributes', () => {
        let variant2Selection = new Map();

        variant2.color.index = productVariationMaster.getAttrTypeValueIndex('color', variant2.instance.customAttributes.color) + 1;
        variant2.size.index = productVariationMaster.getAttrTypeValueIndex('size', variant2.instance.customAttributes.size) + 1;
        variant2.width.index = productVariationMaster.getAttrTypeValueIndex('width', variant2.instance.customAttributes.width) + 1;

        variant2Selection.set('colorIndex', variant2.color.index);
        variant2Selection.set('sizeIndex', variant2.size.index);
        variant2Selection.set('widthIndex', variant2.width.index);

        let expectedColor = productVariationMaster.getLocalizedProperty(`variationAttributes.color.values.${variant2.color.index - 1}.displayValues`, locale);
        let expectedSize = productVariationMaster.getLocalizedProperty(`variationAttributes.size.values.${variant2.size.index - 1}.displayValues`, locale);
        let expectedWidth = productVariationMaster.getLocalizedProperty(`variationAttributes.width.values.${variant2.width.index - 1}.displayValues`, locale);
        return cartPage.updateAttributesByRow(itemRow, variant2Selection)
            .then(() => browser.getText('tr.cart-row:nth-child(1) .attribute[data-attribute=color] .value'))
            .then(color => assert.equal(color, expectedColor))
            .then(() => browser.getText('tr.cart-row:nth-child(1) .attribute[data-attribute=size] .value'))
            .then(size => assert.equal(size, expectedSize))
            .then(() => browser.getText('tr.cart-row:nth-child(1) .attribute[data-attribute=width] .value'))
            .then(width => assert.equal(width, expectedWidth));
    });

    it('should allow deselection of an attribute without deselecting other selected attributes', () => {
        var attrToDeselect = 'size';
        var selectedAttrIndexes = {};
        var editDetailsLink = cartPage.getItemEditLinkByRow(1);
        var variationMaster;

        return browser.waitForVisible(editDetailsLink)
            .click(editDetailsLink)
            .waitForVisible(productQuickViewPage.VARIATION_CONTAINER)

            // Retrieve variation master
            .then(() => productQuickViewPage.getMasterId())
            .then(masterId => testData.getProductById(masterId))
            .then(master => variationMaster = master)

            // Collect index values for attributes already selected
            .then(() => browser.getAttribute(productQuickViewPage.VARIATION_CONTAINER, 'data-attributes'))
            .then(attrs => {
                attrs = JSON.parse(attrs);
                Object.keys(attrs).forEach(attr => {
                    selectedAttrIndexes[attr] = variationMaster.getAttrTypeValueIndex(attr, attrs[attr].value) + 1;
                });
            })

            // Deselect already selected size attribute
            .then(() => common.selectAttributeByIndex(attrToDeselect, selectedAttrIndexes[attrToDeselect], true))

            // Test that previously selected attributes are still selected
            .then(() => productQuickViewPage.isAttrValueSelected('color', selectedAttrIndexes.color))
            .then(isSelected => assert.isTrue(isSelected))
            .then(() => productQuickViewPage.isAttrValueSelected('width', selectedAttrIndexes.width))
            .then(isSelected => assert.isTrue(isSelected))

            // Test that deselected attribute is no longer selected
            .then(() => productQuickViewPage.isAttrValueSelected('size', selectedAttrIndexes.size))
            .then(isSelected => assert.isFalse(isSelected))

            // Tear down - Close the dialog box
            .then(() => browser.click(productQuickViewPage.BTN_CLOSE))
            .waitForVisible(productQuickViewPage.CONTAINER, 500, true);
    });

    it ('should disable the Add to Cart button until all required attributes are selected', () => {
        var attrToDeselect = 'size';
        var selectedAttrIndexes = {};
        var editDetailsLink = cartPage.getItemEditLinkByRow(1);
        var variationMaster;

        return browser.waitForVisible(editDetailsLink)
            .click(cartPage.getItemEditLinkByRow(1))
            .waitForVisible(productQuickViewPage.VARIATION_CONTAINER)
            .then(() => productQuickViewPage.getMasterId())
            .then(masterId => testData.getProductById(masterId))
            .then(master => variationMaster = master)
            .then(() => browser.getAttribute(productQuickViewPage.VARIATION_CONTAINER, 'data-attributes'))
            .then(attrs => {
                attrs = JSON.parse(attrs);
                Object.keys(attrs).forEach(attr => {
                    selectedAttrIndexes[attr] = variationMaster.getAttrTypeValueIndex(attr, attrs[attr].value) + 1;
                });
            })
            .then(() => common.selectAttributeByIndex(attrToDeselect, selectedAttrIndexes.size, true))

            // Verify Add to Cart button is disabled
            .then(() => browser.getAttribute(common.BTN_ADD_TO_CART, 'disabled'))
            .then(isDisabled => assert.equal(isDisabled, 'true'))

            // Tear down - Close the dialog box
            .then(() => browser.click(productQuickViewPage.BTN_CLOSE))
            .waitForVisible(productQuickViewPage.CONTAINER, 500, true);
    });

    it('should update quantity in cart', () =>
        cartPage
            .updateQuantityByRow(itemRow, 3)
            .then(quantity => assert.equal(quantity, 3))
    );
    //TODO : consider to grabbing the text value of the product's price, converting it to a number,
    // then multiplying it by the updated quantity and compare that against what is displayed in the updated Cart
    it('should update price in cart when quantity updated', () =>
        cartPage
            .getPriceByRow(itemRow)
            .then(updatedItemSubTotal =>
                assert.equal(updatedItemSubTotal, updatedPrice[locale])
            )
    );

    it('should remove product from cart', () =>
        cartPage
            .removeItemByRow(1)
            .then(() => cartPage.verifyCartEmpty())
            .then(empty => assert.ok(empty))
    );

});
