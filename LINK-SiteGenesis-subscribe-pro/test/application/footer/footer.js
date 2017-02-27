import {assert} from 'chai';

import * as footerPage from '../pageObjects/footer';
import * as homePage from '../pageObjects/home';
import * as common from '../pageObjects/helpers/common';
import * as formLogin from '../pageObjects/helpers/forms/login';
import * as accountPage from '../pageObjects/account';
import * as navHeader from '../pageObjects/navHeader';
import url from 'url';
import {config} from '../webdriver/wdio.conf';

describe('Footer #C147201', () => {

    // Click on links in the footer, then validate that you got to the right place by checking the URL
    describe('Account links', () => {
        before(() => accountPage.navigateTo()
            .then(() => formLogin.loginAs(config.userEmail))
        );
        after(() => navHeader.logout());

        it('#1 should go to My Account', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.MY_ACCOUNT)
                .waitForVisible(footerPage.MY_ACCOUNT_OPTIONS)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('account'));
                })
        );

        it('#2 should go to Check Order', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.CHECK_ORDER)
                // TODO: Need a better unique element to waitForVisible
                .waitForVisible(common.LAST_BREADCRUMB)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('orders'));
                })
        );

        it('#3 should go to Wish List', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.WISH_LIST)
                // TODO: Need a better unique element to waitForVisible
                .waitForVisible(common.LAST_BREADCRUMB)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('wishlist'));
                })
        );

        it('#4 should go to Gift Registry', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.GIFT_REGISTRY)
                // TODO: Need a better unique element to waitForVisible
                .waitForVisible(common.LAST_BREADCRUMB)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('giftregistry'));
                })
        );
    });

    describe('Customer Service links', () => {
        before(() => homePage.navigateTo());

        it('#1 should go to Contact Us', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.CONTACT_US)
                .waitForVisible(footerPage.CONTACT_US_FORM)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('contactus'));
                })
        );

        it('#2 should go to Gift Certificates', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.GIFT_CERTIFICATES)
                .waitForVisible(footerPage.GIFT_CERTIFICATES_FORM)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('giftcertpurchase'));
                })
        );

        it('#3 should go to Help', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.HELP)
                .waitForVisible(footerPage.HELP_PAGE)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('help'));
                })
        );

        it('#4 should go to Site Map', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.SITE_MAP)
                // TODO: Need a better unique element to waitForVisible
                .waitForVisible(common.PRIMARY_H1)
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('sitemap'));
                })
        );
    });

    describe('About links', () => {
        before(() => homePage.navigateTo());

        // TODO: All of these content page tests should be made more locale-independent
        it('#1 should go to About Us', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.ABOUT_US)
                .waitForVisible(common.BREADCRUMB_A)
                .getText(common.BREADCRUMB_A)
                .then(text => assert.equal(text, footerPage.ABOUT_US_STRING))
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('about-us.html'));
                })
        );

        it('#2 should go to Privacy', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.PRIVACY)
                .waitForVisible(common.BREADCRUMB_A)
                .getText(common.BREADCRUMB_A)
                .then(text => assert.equal(text, footerPage.PRIVACY_POLICY_STRING))
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('privacy-policy.html'));
                })
        );

        it('#3 should go to Terms', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.TERMS_SELECTOR)
                .waitForVisible(common.BREADCRUMB_A)
                .getText(common.BREADCRUMB_A)
                .then(text => assert.equal(text, footerPage.T_AND_C_STRING))
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('terms.html'));
                })
        );

        it('#4 should go to Jobs', () =>
            browser.waitForVisible(footerPage.FOOTER_CONTAINER)
                .click(footerPage.JOBS)
                .waitForVisible(common.BREADCRUMB_A)
                .getText(common.BREADCRUMB_A)
                .then(text => assert.equal(text, footerPage.JOBS_LANDING_STRING))
                .url()
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('jobs-landing.html'));
                })
        );
    });

    describe('Social links', () => {
        before(() => homePage.navigateTo());

        it('#1 should display a Linkedin icon and link', () =>
            browser.isExisting(footerPage.socialLinks.linkedin.selector)
                .then(doesExist => assert.isTrue(doesExist))
                .then(() => browser.getAttribute(footerPage.socialLinks.linkedin.selector, 'href'))
                .then(href => assert.equal(href, footerPage.socialLinks.linkedin.baseUrl))
        );

        it('#2 should display a Facebook icon and link', () =>
            browser.isExisting(footerPage.socialLinks.facebook.selector)
                .then(doesExist => assert.isTrue(doesExist))
                .then(() => browser.getAttribute(footerPage.socialLinks.facebook.selector, 'href'))
                .then(href => assert.equal(href, footerPage.socialLinks.facebook.baseUrl))
        );

        it('#3 should display a Twitter icon and link', () =>
            browser.isExisting(footerPage.socialLinks.twitter.selector)
                .then(doesExist => assert.isTrue(doesExist))
                .then(() => browser.getAttribute(footerPage.socialLinks.twitter.selector, 'href'))
                .then(href => assert.equal(href, footerPage.socialLinks.twitter.baseUrl))
        );

        it('#4 should display a YouTube icon and link', () =>
            browser.isExisting(footerPage.socialLinks.youtube.selector)
                .then(doesExist => assert.isTrue(doesExist))
                .then(() => browser.getAttribute(footerPage.socialLinks.youtube.selector, 'href'))
                .then(href => assert.equal(href, footerPage.socialLinks.youtube.baseUrl))
        );

        it('#5 should go to Contact Us when clicking the email envelope', () =>
            browser.waitForVisible(footerPage.SEND_EMAIL_BUTTON)
                .then(() => browser.click(footerPage.CONTACT_US))
                .then(() => browser.waitForVisible(common.PRIMARY_H1))
                .then(() => browser.getText(common.PRIMARY_H1))
                .then(text => assert.equal(text.indexOf('Contact Us'), 0))
        );
    });
});
