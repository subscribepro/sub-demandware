'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as homePage from '../pageObjects/home';
import * as searchResultsPage from '../pageObjects/search';
import * as testData from '../pageObjects/testData/main';
import * as pricingHelpers from '../pageObjects/helpers/pricing';
import * as productDetailPage from '../pageObjects/productDetail';
import * as promotions from '../pageObjects/promotions';
import * as cartPage from '../pageObjects/cart';
import * as common from '../pageObjects/helpers/common';

describe('Promotions - PromotionTest_WithoutQualifying product tile pricing', () => {

    const locale = config.locale,
        productID1 = '793775370033',
        productID2 = '640188017003',
        productMasterID1 = '25752986',
        productMasterID2 = '25686395',
        productMasterID3 = '25752218';
    let promotionInfo;

    before(() => {
        return testData.load()
            .then(() => {
                const promotion = testData.getPromotionById('PromotionTest_WithoutQualifying');

                promotionInfo = {
                    calloutMsg: promotion.getCalloutMsg(locale),
                    discountThreshold: promotion.getDiscountThreshold(),
                    discountAmount: promotion.getDiscountPercentage()
                };

                return Promise.resolve();
            });
    });

    describe('Category / Search Results', () => {
        it('Should display promotional pricing for the qualifying product tile.', () => {

            const productTile = 'div[data-itemid="' + productMasterID1 + '"]';
            const expectedSalePrice = testData.getPricesByProductId(productMasterID1, locale).sale;

            return browser.url('/mens/accessories/ties/')
                .then(() => browser.waitForVisible(searchResultsPage.PRODUCTGRID_CONTAINER))
                .then(() => browser.getText(productTile + ' ' + searchResultsPage.PRICE_SALE))
                .then(displayedSalePrice => {
                    assert.equal(pricingHelpers.getCurrencyValue(displayedSalePrice, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2))
                })
                .then(() => browser.getText(productTile + ' ' + searchResultsPage.PRICE_LIST))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                });
        });


        it('Should display with promotional messaging for the qualifying product tile.', () => {
            const productTile = 'div[data-itemid="' + productMasterID1 + '"]';

            return browser.getText(productTile + ' ' + '.promotional-message')
                .then(promoCallOut => assert.equal(promoCallOut.toLowerCase(), promotionInfo.calloutMsg.toLowerCase()))
        });

        it('Should display promotional pricing for the qualifying product tile.', () => {
            const productTile = 'div[data-itemid="' + productMasterID2 + '"]';
            const expectedSalePrice = testData.getPricesByProductId(productMasterID2, locale).sale;

            return browser.url('/mens/clothing/suits')
                .then(() => browser.waitForVisible(searchResultsPage.PRODUCTGRID_CONTAINER))
                .then(() => browser.getText(productTile + ' ' + searchResultsPage.PRICE_SALE))
                .then(displayedSalePrice => {
                    assert.equal(pricingHelpers.getCurrencyValue(displayedSalePrice, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2))
                })
                .then(() => browser.getText(productTile + ' ' + searchResultsPage.PRICE_LIST))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                })
        });

        it('Should display with promotional messaging for the qualifying product tile.', () => {
            const productTile = 'div[data-itemid="' + productMasterID2 + '"]';

            return browser.getText(productTile + ' ' + '.promotional-message')
                .then(promoCallOut => assert.equal(promoCallOut.toLowerCase(), promotionInfo.calloutMsg.toLowerCase()))
        });
    });

    describe('Product Details Page', () => {

        before(() => {
            const variant = testData.getProductById(productID1);

            return browser.url(variant.getUrlResourcePath());
        });

        it('Should display with promotional pricing on Product Details Page', () => {
            const expectedSalePrice = testData.getPricesByProductId(productMasterID1, locale).sale;

            browser.getText(productDetailPage.PRICE_SALE)
                .then(price => assert.equal(pricingHelpers.getCurrencyValue(price, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2)))
                .then(() => browser.getText(searchResultsPage.PRICE_LIST))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                })
        });

        it('Should display with promotional messaging on Product Details Page', () =>
            browser.getText(productDetailPage.PROMOTION_CALLOUT)
                .then(promoCallOut => assert.equal(promoCallOut, promotionInfo.calloutMsg))
        );

    });

    describe('Cart : Product Tile Pricing', () => {
        before(() => cartPage.navigateTo());

        it('Should display promotional pricing for the qualifiying product tile.', () => {
            const priceLabelPrefix = `.product-tile[data-itemid='${productID2}'] .product-pricing `;
            const displayedStandardPrice = `${priceLabelPrefix} .product-standard-price`;
            const displayedSalePrice = `${priceLabelPrefix} .product-sales-price`;
            const expectedSalePrice = testData.getPricesByProductId(productMasterID2, locale).sale;

            browser.waitForVisible(cartPage.PRODUCT_SLOT)
                .then(() => browser.getText(displayedSalePrice))
                .then(price => assert.equal(pricingHelpers.getCurrencyValue(price, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2)))
                .then(() => browser.getText(displayedStandardPrice))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                })
        });

        it('Should display promotional messaging for the qualifiying product tile.', () => {
            const productTile = `.product-tile[data-itemid='${productID2}']`;

            return browser.waitForVisible(cartPage.PRODUCT_SLOT)
                .then(() => browser.getText(productTile + ' ' + '.promotional-message'))
                .then(promoMessage => assert.equal(promoMessage.toLowerCase(), promotionInfo.calloutMsg.toLowerCase()))

        });
    });

    describe('Vertical carousel', () => {
        before(() => homePage.navigateTo());

        it('Should display promotional pricing for the qualifying Striped Wool Suit on vertical carousel.', () => {
            const priceLabelPrefix = `.product-tile[data-itemid="${productID2}"] .product-pricing `;
            const displayedStandardPrice = `${priceLabelPrefix} .product-standard-price`;
            const displayedSalePrice = `${priceLabelPrefix} .product-sales-price`;
            const expectedPrice = testData.getPricesByProductId(productMasterID2, locale);
            const expectedSalePrice = expectedPrice.sale;

            return homePage.verticalCarouselSlide(1)
                .then(() => homePage.isVerticalCarouselSlideVisible(1))
                .then(visible => assert.ok(visible))
                .then(() => homePage.verticalCarouselSlide(2))
                .then(() => homePage.isVerticalCarouselSlideVisible(2))
                .then(visible => assert.ok(visible))
                .then(() => browser.getText(displayedSalePrice))
                .then(price => assert.equal(pricingHelpers.getCurrencyValue(price, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2)))
                .then(() => browser.getText(displayedStandardPrice))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                })
        });

        it('Should display promotional pricing for the qualifying Striped Silk Tie on vertical carousal.', () => {
            const priceLabelPrefix = `.product-tile[data-itemid="${productID1}"] .product-pricing `;
            const displayedStandardPrice = `${priceLabelPrefix} .product-standard-price`;
            const displayedSalePrice = `${priceLabelPrefix} .product-sales-price`;
            const expectedPrice = testData.getPricesByProductId(productID1, locale);
            const expectedSalePrice = expectedPrice.sale;

            return homePage.verticalCarouselSlide(3)
                .then(() => homePage.isVerticalCarouselSlideVisible(3))
                .then(visible => assert.ok(visible))
                .then(() => homePage.verticalCarouselSlide(4))
                .then(() => homePage.isVerticalCarouselSlideVisible(4))
                .then(visible => assert.ok(visible))
                .then(() => homePage.verticalCarouselSlide(5))
                .then(() => homePage.isVerticalCarouselSlideVisible(5))
                .then(visible => assert.ok(visible))
                .then(() => browser.getText(displayedSalePrice))
                .then(price => assert.equal(pricingHelpers.getCurrencyValue(price, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2)))
                .then(() => browser.getText(displayedStandardPrice))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                });
        });
    });

    describe('Compare page', () => {
        before(() => browser.url('/mens/accessories/ties/')
           .waitForVisible(searchResultsPage.PRODUCTGRID_CONTAINER)
       );

        it('Should display promotional pricing for the qualifying product Striped Silk Tie on comparePage.', () => {
            const productTile = 'div[data-itemid="' + productMasterID1 + '"]';
            const expectedSalePrice = testData.getPricesByProductId(productMasterID1, locale).sale;
            const product1Selector = '.product-tile[data-itemid="' + productMasterID1 + '"] .product-compare input';
            const product2Selector = '.product-tile[data-itemid="' + productMasterID3 + '"] .product-compare input';

            return common.clickCheckbox(product1Selector)
                .then(() => common.clickCheckbox(product2Selector))
                .then(() => browser.waitForVisible('#compare-items-button'))
                .click('#compare-items-button')
                .waitForVisible('#compare-table')
                .getText(productTile + ' ' + searchResultsPage.PRICE_SALE)
                .then(displayedSalePrice => {
                    assert.equal(pricingHelpers.getCurrencyValue(displayedSalePrice, locale), pricingHelpers.getPercentageDiscountedPrice(expectedSalePrice, locale, promotionInfo.discountAmount).toFixed(2))
                })
                .then(() => browser.getText(productTile + ' ' + searchResultsPage.PRICE_LIST))
                .then(displayedListPrice => {
                    assert.equal(displayedListPrice, expectedSalePrice)
                })
        });

        it('Should display promotional messaging for the qualifying Striped Silk Tie on comparePage.', () => {
            const productTile = 'div[data-itemid="' + productMasterID1 + '"]';

            return browser.getText(productTile + ' ' + '.promotional-message')
                .then(promoCallOut => assert.equal(promoCallOut.toLowerCase(), promotionInfo.calloutMsg.toLowerCase()))
        });

        after(() => browser.waitForVisible(promotions.COMPARE_REMOVE_LINK)
            .then(() => browser.click(promotions.COMPARE_REMOVE_LINK))
            .then(() => browser.refresh())
            .then(() => browser.click(promotions.COMPARE_REMOVE_LINK))
            .then(() => browser.waitForVisible(promotions.COMPARE_REMOVE_LINK))
            .then(() => browser.refresh())
            .then(() => browser.click(promotions.BACK_TO_GRID_LINK))
        );
    });
});
