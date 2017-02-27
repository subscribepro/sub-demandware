'use strict';

import {assert} from 'chai';
import * as homePage from '../pageObjects/home';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import {config} from '../webdriver/wdio.conf';
import * as productQuickView from '../pageObjects/productQuickView';

let locale = config.locale;

describe('Product Details Page', () => {
    before(() => testData.load());

    // TODO:  Refactor these tests to use testData module instead of the search pattern.
    describe('Bundle', () => {
        // Global sites does not have electronic category
        if (locale && locale !== 'x_default') {
            return;
        }

        before(() => homePage.navigateTo()
            .then(() => browser.waitForExist('form[role="search"]')
                .setValue('#q', 'bundle')
                .submitForm('form[role="search"]')
                .waitForExist('#search-result-items')
                .click('[title*="Playstation 3 Bundle"]')
                .waitForVisible(productDetailPage.PDP_MAIN))
        );

        it('should have the right name', () =>
            browser.getText('.product-detail > .product-name')
                .then(title => assert.equal(title, 'Playstation 3 Bundle'))
        );

        it('should have product image', () =>
            browser.isExisting('.primary-image')
                .then(exists => assert.isTrue(exists))
        );

        it('should have all bundled products', () =>
            browser.isExisting('#item-sony-ps3-console')
                .then(exists => assert.isTrue(exists))

        .then(() => browser.isExisting('#item-easports-nascar-09-ps3'))
                .then(exists => assert.isTrue(exists))

        .then(() => browser.isExisting('#item-easports-monopoly-ps3'))
                .then(exists => assert.isTrue(exists))

        .then(() => browser.isExisting('#item-namco-eternal-sonata-ps3'))
                .then(exists => assert.isTrue(exists))

        .then(() => browser.isExisting('#item-sony-warhawk-ps3'))
                .then(exists => assert.isTrue(exists))
        );

        it('should have the right price', () =>
            browser.isExisting('span.price-sales')
                .then(exists => assert.isTrue(exists))
                .then(() => browser.getText('.product-detail .product-add-to-cart .price-sales'))
                .then(price => assert.equal(price, '$449.00'))
        );

        it('should have warranty', () =>
            browser.isExisting('#dwopt_sony-ps3-bundle_consoleWarranty')
                .then(exists => assert.isTrue(exists))
        );

        it('should have add to cart button enabled', () =>
            browser.isEnabled('#add-to-cart')
                .then(enabled => assert.isTrue(enabled))
        );
    });

    describe('Set', () => {
        const productSetId = 'spring-look';
        let expectedProductSetPrice;
        let productSet;
        let productSetProducts = [];

        before(() => {
            expectedProductSetPrice = testData.getPricesByProductId(productSetId, locale);
            productSet = testData.getProductById(productSetId);

            // Get Product Set Products
            productSet.getProductIds().forEach(productId =>
                productSetProducts.push(testData.getProductById(productId))
            );

            return browser.url(productSet.getUrlResourcePath());
        });

        /**
         * Extracts the product item number (the last text token) from the provided string
         *
         * @param {String} label - Localized string of the displayed item number, i.e. "Item No. 12345"
         * @returns {String} - Last string token, i.e. 12345
         */
        function getItemNumber(label) {
            let tokens = label.split(' ');
            return tokens[tokens.length - 1];
        }

        it('should display its product name', () =>
            browser.getText(productDetailPage.PRODUCT_NAME)
                .then(title => assert.equal(title, productSet.getDisplayName()))
        );

        it('should display a primary image', () =>
            browser.getAttribute(productDetailPage.PRIMARY_IMAGE, 'src')
                .then(imgSrc => assert.isTrue(imgSrc.endsWith(productSet.getImage('large'))))
        );

        it('should display its associated products with their first variants selected', () =>
            browser.elements(productDetailPage.PRODUCT_SET_LIST)
                .then(elements => elements.value.reduce((testValues, element, idx) => {
                    return testValues.then(() =>
                        browser.elementIdText(element.ELEMENT)
                            .then(itemNumberLabel =>
                                assert.equal(getItemNumber(itemNumberLabel.value), productSetProducts[idx].getVariantProductIds()[0])
                            )
                    );
                }, Promise.resolve()))
        );

        it('should display the sum of its products as its price', () =>
            browser.getText(productDetailPage.PRODUCT_SET_TOTAL_PRICE)
                .then(price => assert.equal(price, expectedProductSetPrice))
        );

        it('should display the "Add to Cart" button as enabled', () =>
            browser.isEnabled(productDetailPage.BTN_ADD_ALL_TO_CART)
                .then(enabled => assert.ok(enabled))
        );

        describe('Product Item', () => {
            let productItem;
            let firstVariant;

            before(() => {
                productItem = productSetProducts[0];
                firstVariant = testData.getProductById(productItem.getVariantProductIds()[0]);
            });

            /**
             * Generate attribute selector string for an attribute type (color, size) for a specific product
             *
             * @param {String} pid - product ID
             * @param {String} attrType - attribute type, such as color, size, or width
             * @returns {String} - CSS selector to retrieve attribute choices
             */
            function generateAttrSelector (pid, attrType) {
                return `#item-${pid} .swatches.${attrType.toLowerCase()} li`;
            }

            it('should display its product ID', () =>
                browser.getText(`#item-${firstVariant.id} .product-number`)
                    .then(itemNumber => assert.isTrue(itemNumber.indexOf(firstVariant.id) > -1))
            );

            it('should display its attribute choices', () =>
                productItem.getAttrTypes().reduce((getAttr, attrType) => {
                    // Get the attribute element wrapper
                    return browser.element(`${productDetailPage.PRODUCT_SET_ITEM_VARIATIONS} ul.swatches.${attrType.toLowerCase()}`)
                        // Find all <a> tags for this element.  Number of tags should equal number of attribute values.
                        .then(attrSwatch => browser.elementIdElements(attrSwatch.value.ELEMENT, 'a'))
                        .then(anchorTags => assert.equal(anchorTags.value.length, productItem.variationAttributes[attrType].values.length));
                }, Promise.resolve())
            );

            it('should display the first variant\'s selected attribute values as selected', () =>
                productItem.getAttrTypes().reduce((getAttr, attrType) => {
                    let attrValues = productItem.getAttrValuesByType(attrType);
                    let variantAttrValue = firstVariant.customAttributes[attrType];
                    let expectedSelectedIndex = attrValues.indexOf(variantAttrValue);

                    return browser.elements(generateAttrSelector(firstVariant.id, attrType))
                        .then(attrChoices => {
                            return browser.elementIdAttribute(attrChoices.value[expectedSelectedIndex].ELEMENT, 'class');
                        })
                        .then(expectedSelected => assert.isTrue(expectedSelected.value.indexOf('selected') > -1));
                }, Promise.resolve())
            );

            it('should display the first variant\'s selected attribute value labels', () =>
                productItem.getAttrTypes().reduce((getAttr, attrType) => {
                    return browser.getText(generateAttrSelector(firstVariant.id, attrType) + '.selected-value')
                        .then(selectedValue => {
                            let expectedValue = productItem.getAttrDisplayValue(attrType, firstVariant.customAttributes[attrType]).toUpperCase();
                            return assert.equal(selectedValue, expectedValue);
                        });
                }, Promise.resolve())
            );
        });
    });

    describe('Variation Master', () => {
        let defaultVariant;
        let expectedListPrice;
        let expectedSalePrice;
        let firstAttributeID;
        let firstAttributeValues;
        let prices;
        let variationMaster;

        before(() => {
            variationMaster = testData.getProductVariationMaster();
            defaultVariant = testData.getProductById(variationMaster.getVariantProductIds()[0]);
            firstAttributeID = variationMaster.getAttrTypes()[0];
            firstAttributeValues = variationMaster.getAttrValuesByType(firstAttributeID);
            prices = testData.getPricesByProductId(variationMaster.id, locale);
            expectedListPrice = prices.list;
            expectedSalePrice = prices.sale;

            return browser.url(variationMaster.getUrlResourcePath());
        });

        it('should display a product name', () =>
            browser.getText(productDetailPage.PRODUCT_NAME)
                .then(name => assert.equal(name, variationMaster.getLocalizedProperty('pageAttributes.pageTitle', locale)))
        );

        it('should display a product image', () =>
            browser.isExisting('.primary-image')
                .then(exists => assert.isTrue(exists))
        );

        it('should display the default Variant primary image', () => {
            return browser.element(productDetailPage.PRIMARY_IMAGE)
                .then(el => browser.elementIdAttribute(el.value.ELEMENT, 'src'))
                .then(src => {
                    let primaryImagePath = variationMaster.getImage('large', defaultVariant.customAttributes[firstAttributeID]);
                    assert.isTrue(src.value.endsWith(primaryImagePath));
                });
        });

        it('should display the default Variant thumbnail images', () => {
            let defaultThumbnailPaths = variationMaster.getImages('small', defaultVariant.customAttributes[firstAttributeID]);
            let displayedThumbnailPaths;

            return browser.waitUntil(
                    () => productDetailPage.getDisplayedThumbnailPaths()
                        .then(paths => paths.length === defaultThumbnailPaths.length)
                )
                .then(() => productDetailPage.getDisplayedThumbnailPaths())
                .then(paths => displayedThumbnailPaths = paths)

                // Retrieve default thumbnail paths to test whether they are currently displayed
                .then(() => defaultThumbnailPaths.reduce(
                    (promise, defaultPath) => assert.isTrue(displayedThumbnailPaths.indexOf(defaultPath) > -1),
                    Promise.resolve()
                ));
        });

        it('should display the primary image of the first Variant matching selected attributes', () => {
            let expectedPrimaryImage = variationMaster.getImage('large', firstAttributeValues[0]);

            // Click first color swatch and test displayed images against what is expected
            return browser.element(productDetailPage.SWATCH_COLOR_ANCHORS)
                .click()
                .waitForVisible('.loader', 1000, true)
                .element(productDetailPage.PRIMARY_IMAGE)
                .then(el => browser.elementIdAttribute(el.value.ELEMENT, 'src'))
                .then(displayedImgSrc => assert.equal(productDetailPage.getImagePath(displayedImgSrc.value), expectedPrimaryImage));
        });

        it('should display the thumbnail images of the first Variant matching selected attributes', () => {
            let attrValue = firstAttributeValues[0];
            let displayedThumbnailPaths;
            // This waitUntil is necessary to ensure that the thumbnail images have been replaced with the images that
            // match the newly selected value before assertions are made.  This only checks the first thumbnail.
            return browser.waitUntil(() =>
                browser.element(productDetailPage.PRODUCT_THUMBNAILS_IMAGES)
                    .then(el => browser.elementIdAttribute(el.value.ELEMENT, 'src'))
                    .then(src => src.value.indexOf(attrValue) > -1)
                )
                .then(() => productDetailPage.getDisplayedThumbnailPaths())
                .then(paths => displayedThumbnailPaths = paths)

                // Retrieve default thumbnail paths to test whether they are currently displayed
                .then(() => variationMaster.getImages('small', attrValue))
                .then(expectedThumbnailPaths =>
                    expectedThumbnailPaths.reduce(
                        (promise, defaultPath) =>
                        assert.isTrue(displayedThumbnailPaths.indexOf(defaultPath) > -1),
                        Promise.resolve()
                    )
                );
        });

        it('should display a struck out list price when applicable', () =>
            browser.getText(productDetailPage.PRICE_SALE)
                .then(price => assert.equal(price, expectedSalePrice))
        );

        it('should display a sale price when applicable', () =>
            browser.getText(productDetailPage.PRICE_LIST)
                .then(price => assert.equal(price, expectedListPrice))
        );

        it('should not enable the "Add to Cart" button if required attributes are not selected', () =>
            browser.isEnabled('#add-to-cart')
                .then(enabled => assert.isFalse(enabled))
        );

        it('should redirect to a Variant PDP when it only has one variant with two attributes each with one value and first attribute is selected', () => {
            const masterWithOneVariant = '25795715';
            const master = testData.getProductById(masterWithOneVariant);
            const variantID = master.getVariantProductIds()[0];
            const firstAttrType = master.getAttrTypes()[0];
            const variant = testData.getProductById(variantID);
            const firstAttrValue = variant.customAttributes[firstAttrType];
            const masterUrl = master.getUrlResourcePath();
            const queryString = `&dwvar_${masterWithOneVariant}_${firstAttrType}=${firstAttrValue}`;

            return browser.url(masterUrl + queryString)
                .then(() => browser.getValue(productDetailPage.PID))
                .then(pid => assert.equal(pid, variantID));
        });

        it('should enable the Add to Cart button when all required attributes are selected', () =>
            browser.element(productDetailPage.BTN_ADD_TO_CART)
                .then(button => browser.elementIdEnabled(button.value.ELEMENT))
                .then(enabled => assert.isTrue(enabled.value))
        );
    });

    describe('Quick View', () => {
        const basePath = '/mens/clothing/suits';
        const firstProductInGridTile = '#search-result-items li:nth-child(1) .product-image';
        const searchResultItems = '#search-result-items';
        let productTiles;

        before(() => browser.url(basePath));

        it('should display product image for each product', () =>
            browser.waitForVisible(searchResultItems)
                .then(() => browser.elements('#search-result-items .grid-tile'))
                .then(tiles => productTiles = tiles.value)
                .then(() => browser.moveToObject(firstProductInGridTile))
                .then(() => browser.click(productQuickView.BTN_QUICK_VIEW))
                .then(() => browser.waitForVisible(productQuickView.CONTAINER))
                .then(() => productTiles.reduce(checkImage => {
                    //check all products in sequence
                    return checkImage.then(() => {
                        let productID;
                        let expectedPrimaryImage;
                        return browser.getText(productQuickView.PRODUCT_ID)
                            .then(id => {
                                productID = id;
                                return expectedPrimaryImage = testData.getProductById(productID).getImage('large');
                            })
                            .then(() => browser.getAttribute(productQuickView.PRODUCT_PRIMARY_IMAGE, 'src'))
                            .then(src => {
                                // make sure product image equals to the testData image
                                assert.equal(productDetailPage.getImagePath(src), expectedPrimaryImage);
                                // check if there is next product
                                return browser.isEnabled(productQuickView.BTN_NEXT);
                            })
                            .then(enabled => {
                                if (!enabled) {
                                    return Promise.resolve();
                                }
                                // click next product, wait for it to load
                                return browser.click(productQuickView.BTN_NEXT)
                                    .then(() => browser.waitUntil(() =>
                                        browser.getText(productQuickView.PRODUCT_ID)
                                            .then(id => id !== productID))
                                    );
                            });
                    });
                }, Promise.resolve()))
        );

    });
});
