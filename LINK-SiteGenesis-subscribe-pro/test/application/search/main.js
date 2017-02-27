'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as homePage from '../pageObjects/home';
import * as search from '../pageObjects/search';
import * as testData from '../pageObjects/testData/main';

describe('Search', () => {
    let singleResultKeyword = 'pack and go';
    let productNoVariantsKeyword = 'sony-xel-1';
    let bundleKeyword = 'Playstation 3 Bundle';
    let productSetKeyword = 'Fall Look';
    let productVariationMaster;
    let variantIds;
    let locale = config.locale;

    before(() => testData.load()
        .then(() => testData.parsedData.catalog)
        .then(() => {
            productVariationMaster = testData.getProductVariationMaster();
            variantIds = productVariationMaster.getVariantProductIds();
            return Promise.resolve();
        })
    );

    beforeEach(() => homePage.navigateTo()
        .then(() => browser.waitForExist(search.SEARCH_FORM))
    );

    // We are using a known test case here. In controllers prior to a fix when
    // searching for "pack and go" it would result in an error page.
    it('should return a PDP when searching for keywords that return only one result', () =>
        browser.setValue('#q', singleResultKeyword)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.PDP_MAIN))
            .then(() => browser.isExisting(search.PDP_MAIN))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should return a PDP when searching for a specific product that has no variants', () => {
        if (locale && locale !== 'x_default') {
            return;
        }
        return browser.setValue('#q', productNoVariantsKeyword)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.PDP_MAIN))
            .then(() => browser.isExisting(search.PDP_MAIN))
            .then(doesExist => assert.isTrue(doesExist));
    });

    it('should return a PDP when searching for a Product Bundle', () => {
        if (locale && locale !== 'x_default') {
            return;
        }
        return browser.setValue('#q', bundleKeyword)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.PDP_MAIN))
            .then(() => browser.isExisting(search.PDP_MAIN))
            .then(doesExist => assert.isTrue(doesExist));
    });

    it('should return a PDP when searching for a Product Set', () =>
        browser.setValue('#q', productSetKeyword)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.PDP_MAIN))
            .then(() => browser.isExisting(search.PDP_MAIN))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should search using a master product ID', () =>
        browser.setValue('#q', productVariationMaster.id)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.PDP_MAIN))
            .then(() => browser.getText(search.PRODUCTID_TEXT))
            .then(displayText => assert.equal(displayText, productVariationMaster.id))
    );

    it('should search using a variation product ID', () =>
        browser.setValue('#q', variantIds[1])
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.PDP_MAIN))
            .then(() => browser.getText(search.PRODUCTID_TEXT))
            .then(displayText => assert.equal(displayText, variantIds[1]))
    );

    it('should return a product grid page when searching for a keyword that returns greater than one result', () =>
        browser.setValue('#q', 'shirt')
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.BREADCRUMB_RESULT_TEXT))
            .then(() => browser.elements('.grid-tile'))
            .then(productTiles => assert(productTiles.value.length > 1, 'there is one or fewer results'))
    );

    it('should display the no hits banner with term suggest when no items are found and searched term has close spelling to possible products', () =>
        browser.setValue('#q', 'lake')
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.NO_HITS))
            .then(() => browser.isExisting(search.NO_HITS_TERM_SUGGEST))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should display the no hits banner when no items found', () =>
        browser.setValue('#q', 'TheMuffinMan')
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .then(() => browser.waitForExist(search.NO_HITS))
            .then(() => browser.isExisting(search.NO_HITS_TERM_SUGGEST))
            .then(doesExist => assert.isFalse(doesExist))
    );

});
