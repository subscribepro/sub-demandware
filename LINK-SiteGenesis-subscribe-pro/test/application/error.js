'use strict';

import {assert} from 'chai';
import * as homePage from './pageObjects/home';
import * as search from './pageObjects/search';
import * as common from './pageObjects/helpers/common';
import url from 'url';

describe('Error Redirects', () => {
    let simpleRedirect = 'about';
    let contactUsRedirect = 'contact us';
    let aboutUsString = 'About Us'

    beforeEach(() => homePage.navigateTo()
        .then(() => browser.waitForExist(search.SEARCH_FORM))
    );

    it('should redirect to a simple HTTP content asset page (About Us)', () =>
        browser.setValue('#q', simpleRedirect)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .waitForVisible(common.BREADCRUMB_A)
            .getText(common.BREADCRUMB_A)
            // TODO: Update to retrieve localized string once RAP-4831 (testData: Create parser for library.xml) has been completed.
            .then(text => assert.equal(text, aboutUsString))
    );

    it('should redirect from HTTP to an HTTPS page, Contact Us', () =>
        browser.setValue('#q', contactUsRedirect)
            .then(() => browser.submitForm(search.SEARCH_FORM))
            .waitForVisible(search.CONTACT_US_FORM)
            .url()
            .then(currentUrl => {
                let parsedUrl = url.parse(currentUrl.value);
                assert.isTrue(parsedUrl.href.startsWith('https'));
                return assert.isTrue(parsedUrl.pathname.endsWith('contactus'));
            })
    );

});
