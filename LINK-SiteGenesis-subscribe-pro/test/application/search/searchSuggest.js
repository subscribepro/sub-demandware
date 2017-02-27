'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as homePage from '../pageObjects/home';
import * as search from '../pageObjects/search';
let keyword;

describe('Search Suggest', () => {
    const locale = config.locale;

    beforeEach(() => homePage.navigateTo()
        .then(() => browser.waitForExist(search.SEARCH_FORM))
        .then(() => keyword = search.keywordMap[locale])
    );

    it('should display the searchSuggestions div after three characters', () => {
        return browser.setValue('#q', keyword)
            .then(() => browser.waitForExist(search.SEARCH_SUGGESTIONS_DIV))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_DIV))
            .then(doesExist => assert.isTrue(doesExist))

    });

    it('should display the searchSuggestions phrase after three characters', () => {
        return browser.setValue('#q', keyword)
            .then(() => browser.waitForExist(search.SEARCH_SUGGESTIONS_DIV))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_DIV))
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_PHRASE))
            .then(doesExist => assert.isTrue(doesExist))
    });

    it('should display the searchSuggestions products after three characters', () => {
        return browser.setValue('#q', keyword)
            .then(() => browser.waitForExist(search.SEARCH_SUGGESTIONS_DIV))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_DIV))
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_PRODUCTS))
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.elements(search.SEARCH_SUGGESTIONS_PRODUCTS))
            .then(productHits => assert.isAbove(productHits.value.length, 1))

    });

    it('should display the searchSuggestions phrases after three characters', () => {
        return browser.setValue('#q', keyword)
            .then(() => browser.waitForExist(search.SEARCH_SUGGESTIONS_DIV))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_DIV))
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_PHRASES))
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.elements(search.SEARCH_SUGGESTIONS_PHRASES))
            .then(hits => assert.isAbove(hits.value.length, 1))
    });

    it('should not display the searchSuggestions div with random characters', () => {
        return browser.setValue('#q', search.noResultsKeyword)
            .then(() => browser.isExisting(search.SEARCH_SUGGESTIONS_DIV))
            .then(doesExist => assert.isFalse(doesExist))
    });

});
