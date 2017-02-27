'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as giftRegistryPage from '../pageObjects/giftRegistry';
import * as testData from '../pageObjects/testData/main';
import * as customers from '../pageObjects/testData/customers';
import * as productDetailPage from '../pageObjects/productDetail';
import * as common from '../pageObjects/helpers/common';
import * as productQuickViewPage from '../pageObjects/productQuickView';

const locale = config.locale;
const userEmail = config.userEmail;

describe('Edit details of item in gift registry', () => {
    let eventFormData = {};
    let eventFormShippingData = {};
    let product = new Map();
    let productResourcePath;
    let productToAdd;

    let updatedProductAttributes = {
        quantity: 2
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
            product.set('colorIndex', 1);
            product.set('sizeIndex', 1);

            productToAdd = testData.getProductById('701644259273');
            productResourcePath = productToAdd.getUrlResourcePath();
            const customer = testData.getCustomerByLogin(userEmail);
            const address = customer.getPreferredAddress();

            customer.addresses[0].postalCode = customers.globalPostalCode[locale];
            customer.addresses[0].countryCode = customers.globalCountryCode[locale];
            customer.addresses[0].phone = customers.globalPhone[locale];

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
        .then(() => giftRegistryPage.createGiftRegistry(locale, eventFormData, eventFormShippingData))
    );

    after(() => {
        return giftRegistryPage.giftRegistryCleanUp()
    });

    it('should add a product to the gift registry', () =>
        browser.url(productResourcePath)
            .then(() => browser.click(productDetailPage.BTN_ADD_TO_GIFT_REGISTRY))
            .then(() => browser.waitForVisible(giftRegistryPage.GIFT_REGISTRY_PORDUCT_LIST_FORM))
            .then(() => browser.getText(giftRegistryPage.PRODUCT_LIST_ITEM))
            .then(text => assert.equal(text, productToAdd.getDisplayName(locale)))
    );

    it('Should navigate to the users gift registry', () =>
        giftRegistryPage.navigateTo()
            .then(() => browser.click(giftRegistryPage.VIEW_REGISTRY))
            .then(() => browser.getText(giftRegistryPage.REGISTRY_HEADING))
            .then(eventTitle => assert.equal(eventTitle, giftRegistryTitle[locale]))
    );

    it('Should click edit details and open the product quickview page', () =>
        browser.click(giftRegistryPage.EDIT_DETAILS_LINK)
            .then(() => browser.waitForVisible(giftRegistryPage.EDIT_DETAILS_POP_UP))
            .then(() => browser.isExisting(giftRegistryPage.UPDATE_BTN))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('Should select a new variation and update the item in the product list', () =>
            productQuickViewPage.deselectAllAttributes()
            .then(() => common.selectAttributeByIndex('color', 1))
            .then(() => common.selectAttributeByIndex('size', 1))
            .then(() => browser.getText(giftRegistryPage.QUICK_VIEW_ITEM_NUMBER))
            .then(item => updatedProductAttributes.itemNumber = item)
            .then(() => browser.getText(giftRegistryPage.SWATCH_COLOR_VALUE))
            .then(colorText => updatedProductAttributes.color = colorText)
            .then(() => browser.getText(giftRegistryPage.SWATCH_SIZE_VALUE))
            .then(sizeText => updatedProductAttributes.size = sizeText)

            // Update the quantity
            // There seems to be an issue with Webdriver
            // unknown error: cannot focus element
            // Known issue -- https://bugs.chromium.org/p/chromedriver/issues/detail?id=35

            //.then(() => browser.setValue(giftRegistryPage.QUICK_VIEW_ITEM_QUANTITY, updatedProductAttributes.quantity))
            //.then(() => browser.waitUntil(() =>
            //    browser.getValue(giftRegistryPage.QUICK_VIEW_ITEM_QUANTITY)
            //        .then(
            //            quantity => quantity === updatedProductAttributes.quantity,
            //            () => false
            //        )
            //))

            .then(() => browser.click(giftRegistryPage.UPDATE_BTN))

            .then(() => browser.waitUntil(() =>
                browser.getText(giftRegistryPage.ITEM_NUMBER)
                    .then(
                        itemNum => itemNum === updatedProductAttributes.itemNumber
                    )
            ))
            .then(() => browser.getText(giftRegistryPage.ITEM_NUMBER))
            .then(displayText => assert.equal(displayText, updatedProductAttributes.itemNumber))
    );

    it ('Should verify that item was updated in the gift registry', () =>
        browser.getText(giftRegistryPage.ITEM_NUMBER)
            .then(itemNum => assert.equal(itemNum, updatedProductAttributes.itemNumber))
            .then(() => browser.getText(giftRegistryPage.ITEM_COLOR))
            .then(color => assert.equal(color.toUpperCase(), updatedProductAttributes.color))
            .then(() => browser.getText(giftRegistryPage.ITEM_SIZE))
            .then(size => assert.equal(size, updatedProductAttributes.size))
            //.then(() => browser.getValue(giftRegistryPage.DESIRED_QUANTITY))
            //.then(quantity => assert.equal(quantity, updatedProductAttributes.quantity))
    );
});
