import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as giftRegistryPage from '../pageObjects/giftRegistry';
import * as testData from '../pageObjects/testData/main';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as footerPage from '../pageObjects/footer';
import * as customers from '../pageObjects/testData/customers';
import * as Resource from '../../mocks/dw/web/Resource';
import * as productDetailPage from '../pageObjects/productDetail';
import * as cartPage from '../pageObjects/cart';

const locale = config.locale;
const userEmail = config.userEmail;

describe('Gift Registry', () => {
    let eventFormData = {};
    let eventFormShippingData = {};
    let firstName;
    let giftCert = Resource.msg('global.giftcertificate', 'locale', null);
    let lastName;
    let productToAdd;
    let productResourcePath;

    let socialLinks = {
        facebook: {
            selector: 'a[data-share=facebook]',
            baseUrl: 'https://www.facebook.com/sharer/sharer.php',
            regex: /.*\?.*u=.+/
        },
        twitter: {
            selector: 'a[data-share=twitter]',
            baseUrl: 'https://twitter.com/intent/tweet/',
            regex: /.*\?.*url=.+/
        },
        googlePlus: {
            selector: 'a[data-share=googleplus]',
            baseUrl: 'https://plus.google.com/share',
            regex: /.*\?.*url=.+/
        },
        pinterest: {
            selector: 'a[data-share=pinterest]',
            baseUrl: 'https://www.pinterest.com/pin/create/button/',
            regex: /.*\?.*url=.+/
        },
        emailLink: {
            selector: 'a[data-share=email]',
            baseUrl: 'mailto:name@email.com',
            regex: /.*\&.*body=.+/
        },
        shareLinkIcon: {
            selector: giftRegistryPage.SHARE_LINK
        },
        shareLinkUrl: {
            selector: '.share-link-content a',
            baseUrl: config.baseUrl,
            regex: /.*\?.*ID=.+/
        }
    };

    let giftRegistryTitle = {
        'x_default': 'WEDDING OF THE CENTURY - 3/28/08',
        'en_GB': 'WEDDING OF THE CENTURY - 28/03/2008',
        'fr-FR': 'mariage du siècle - 3/28/08',
        'it-IT': 'matrimonio del secolo - 3/28/08',
        'ja-JP': '世紀の結婚式 -2008年3月28日',
        'zh-CN': '世纪婚礼 - 2008年3月28号'
    };

    before(() => testData.load()
        .then(() => {
            productToAdd = testData.getProductById('701644389758');
            productResourcePath = productToAdd.getUrlResourcePath();
            const customer = testData.getCustomerByLogin(userEmail);
            const address = customer.getPreferredAddress();

            firstName = customer.firstName;
            lastName = customer.lastName;

            address.postalCode = customers.globalPostalCode[locale];
            address.countryCode = customers.globalCountryCode[locale];
            address.phone = customers.globalPhone[locale];

            eventFormData = {
                type: 'wedding',
                name: 'Wedding of the Century',
                date: '03/28/2008',
                eventaddress_country: address.countryCode,
                town: address.city,
                participant_role: 'Groom',
                participant_firstName: customer.firstName,
                participant_lastName: customer.lastName,
                participant_email: customer.email
            };

            eventFormShippingData = {
                addressid: 'summerHome',
                firstname: customer.firstName,
                lastname: customer.lastName,
                address1: address.address1,
                city: address.city,
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };

            if (locale && (locale === 'x_default' || locale === 'en_US')) {
                eventFormData.eventaddress_states_state = address.stateCode;
                eventFormShippingData.states_state = address.stateCode;
            }
        })
        .then(() => giftRegistryPage.navigateTo())
        .then(() => loginForm.loginAs(userEmail))
        .then(() => browser.waitForVisible(giftRegistryPage.BTN_CREATE_REGISTRY))
        .then(() => giftRegistryPage.emptyAllGiftRegistries())
        .then(() => browser.click(giftRegistryPage.BTN_CREATE_REGISTRY))
        .then(() => browser.waitForVisible(giftRegistryPage.FORM_REGISTRY))
    );

    after(() =>
        cartPage.emptyCart()
        .then(() => navHeader.logout())
    );

    it('should fill out the event form', () =>
        giftRegistryPage.fillOutEventForm(eventFormData, locale)
            // FIXME: This button is always enabled, even if form is not filled
            // out.  Would be better to check on some other attribute RAP-4690
            .then(() => browser.isEnabled(giftRegistryPage.BTN_EVENT_SET_PARTICIPANTS))
            .then(enabled => assert.ok(enabled))
    );

    it('should fill out the event shipping form', () =>
        browser.click(giftRegistryPage.BTN_EVENT_SET_PARTICIPANTS)
            .waitForVisible(giftRegistryPage.USE_PRE_EVENT)
            .then(() => giftRegistryPage.fillOutEventShippingForm(eventFormShippingData, locale))
            // This wait is necessary, since without it, the .click() will fire
            // even if the required fields have not been filled in
            .then(() => browser.waitForValue('[name*=addressBeforeEvent_phone]')
                .click(giftRegistryPage.USE_PRE_EVENT)
                .waitForVisible(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE)
                .isEnabled(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE)
            )
            .then(enabled => assert.ok(enabled))
    );

    it('should submit the event', () =>
        browser.click(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE)
            .waitForVisible(giftRegistryPage.BTN_EVENT_CONFIRM)
            .click(giftRegistryPage.BTN_EVENT_CONFIRM)
            .waitForVisible(giftRegistryPage.REGISTRY_HEADING)
            .getText(giftRegistryPage.REGISTRY_HEADING)
            .then(eventTitle => assert.equal(eventTitle, giftRegistryTitle[locale]))
    );

    it('should make the gift registry public', () =>
        browser.click(giftRegistryPage.BTN_SET_PUBLIC)
            .waitForVisible(giftRegistryPage.SHARE_OPTIONS)
            .isVisible(giftRegistryPage.SHARE_OPTIONS)
            .then(visible => assert.isTrue(visible))
    );

    it('should display a Facebook icon and link', () =>
        browser.isExisting(socialLinks.facebook.selector)
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.getAttribute(socialLinks.facebook.selector, 'href'))
            .then(href => {
                assert.isTrue(href.startsWith(socialLinks.facebook.baseUrl));
                assert.ok(href.match(socialLinks.facebook.regex));
            })
    );

    it('should display a Twitter icon and link', () =>
        browser.isExisting(socialLinks.twitter.selector)
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.getAttribute(socialLinks.twitter.selector, 'href'))
            .then(href => {
                assert.isTrue(href.startsWith(socialLinks.twitter.baseUrl));
                assert.ok(href.match(socialLinks.twitter.regex));
            })
    );

    it('should display a Google Plus icon and link', () =>
        browser.isExisting(socialLinks.googlePlus.selector)
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.getAttribute(socialLinks.googlePlus.selector, 'href'))
            .then(href => {
                assert.isTrue(href.startsWith(socialLinks.googlePlus.baseUrl));
                assert.ok(href.match(socialLinks.googlePlus.regex));
            })
    );

    it('should display a Pinterest icon and link', () =>
        browser.isExisting(socialLinks.pinterest.selector)
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.getAttribute(socialLinks.pinterest.selector, 'href'))
            .then(href => {
                assert.isTrue(href.startsWith(socialLinks.pinterest.baseUrl));
                assert.ok(href.match(socialLinks.pinterest.regex));
            })
    );

    it('should display a Mail icon and link', () =>
        browser.isExisting(socialLinks.emailLink.selector)
            .then(doesExist => assert.isTrue(doesExist))
            .then(() => browser.getAttribute(socialLinks.emailLink.selector, 'href'))
            .then(href => {
                assert.isTrue(href.startsWith(socialLinks.emailLink.baseUrl));
                assert.ok(href.match(socialLinks.emailLink.regex));
            })
    );

    it('should display a link icon', () =>
        browser.isExisting(socialLinks.shareLinkIcon.selector)
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should display a URL when chain icon clicked', () =>
        browser.click(giftRegistryPage.SHARE_LINK)
            .waitForVisible(socialLinks.shareLinkUrl.selector)
            .isVisible(socialLinks.shareLinkUrl.selector)
            .then(visible => assert.isTrue(visible))
            .then(() => browser.getAttribute(socialLinks.shareLinkUrl.selector, 'href'))
            .then(href => {
                assert.isTrue(href.startsWith(socialLinks.shareLinkUrl.baseUrl));
                assert.ok(href.match(socialLinks.shareLinkUrl.regex));
            })
    );

    it('should add gift certificate to gift registry', () =>
        browser.click(giftRegistryPage.BTN_ADD_GIFT_CERT)
            .then(() => browser.waitForVisible(giftRegistryPage.ITEM_LIST))
            .then(() => browser.getText(giftRegistryPage.GIFT_CERT_ADDED_TO_GIFT_REGISTRY))
            .then(text => assert.equal(text, giftCert))
    );

    it('should add a product to the gift registry', () =>
        browser.url(productResourcePath)
            .then(() => browser.click(productDetailPage.BTN_ADD_TO_GIFT_REGISTRY))
            .then(() => browser.waitForVisible(giftRegistryPage.GIFT_REGISTRY_PORDUCT_LIST_FORM))
            .then(() => browser.getText(giftRegistryPage.ITEM_ADDED_TO_GIFT_REGISTRY))
            .then(text => assert.equal(text, productToAdd.getDisplayName(locale)))
    );

    it('should add a product to the cart', () =>
        browser.click(giftRegistryPage.BTN_ADD_PRODUCT_TO_CART)
            .then(() => browser.waitForVisible(cartPage.CART_ITEMS))
            .then(() => browser.getText(cartPage.ITEM_NAME))
            .then(text => assert.equal(text, productToAdd.getDisplayName(locale)))
    );

    it('should return the event at Gift Registry search', () => {
        return navHeader.logout()
            .then(() => browser.click(footerPage.GIFT_REGISTRY))
            .waitForVisible(footerPage.GIFT_REGISTRY)
            .then(() => giftRegistryPage.searchGiftRegistry(
                lastName,
                firstName,
                giftRegistryPage.eventType))
            .then(() => giftRegistryPage.getGiftRegistryCount())
            .then(rows => assert.equal(1, rows))
            .then(() => giftRegistryPage.openGiftRegistry())
            .then(() => browser.waitForVisible(giftRegistryPage.BUTTON_FIND))
            .getText(giftRegistryPage.eventTitle)
            .then(str => assert.equal(str, giftRegistryTitle[locale]));
    });

    it('should delete all the gift registry events', () => {
        return giftRegistryPage.navigateTo()
            .then(() => loginForm.loginAs(userEmail))
            .then(() => browser.waitForVisible(giftRegistryPage.BTN_CREATE_REGISTRY))
            .then(() => giftRegistryPage.emptyAllGiftRegistries())
            .then(() => browser.isExisting(giftRegistryPage.LINK_REMOVE))
            .then(doesExist => assert.isFalse(doesExist));
    });
});
