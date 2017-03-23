'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as giftRegistryPage from '../pageObjects/giftRegistry';
import * as testData from '../pageObjects/testData/main';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as footerPage from '../pageObjects/footer';
import * as customers from '../pageObjects/testData/customers';

let locale = config.locale;

describe('Private Gift Registries', () => {
    let publicEventFormData = {};
    let privateEventFormData = {};
    let eventFormShippingData = {};
    let firstName;
    let lastName;
    const userEmail = config.userEmail;

    before(() => testData.load()
        .then(() => {
            const customer = testData.getCustomerByLogin(userEmail);
            const address = customer.getPreferredAddress();

            firstName = customer.firstName;
            lastName = customer.lastName;

            address.postalCode = customers.globalPostalCode[locale];
            address.countryCode = customers.globalCountryCode[locale];
            address.phone = customers.globalPhone[locale];

            publicEventFormData = {
                type: 'wedding',
                name: 'Public Registry',
                date: '03/28/2008',
                eventaddress_country: address.countryCode,
                town: address.city,
                participant_role: 'Groom',
                participant_firstName: customer.firstName,
                participant_lastName: customer.lastName,
                participant_email: customer.email
            };

            privateEventFormData = {
                type: 'wedding',
                name: 'Private Registry',
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

            if (locale === 'x_default' || locale === 'en_US') {
                publicEventFormData.eventaddress_states_state = address.stateCode;
                privateEventFormData.eventaddress_states_state = address.stateCode;
                eventFormShippingData.states_state = address.stateCode;
            }
        })
    );

    after(() => {
        return giftRegistryPage.giftRegistryCleanUp()
    });

    it('should create a public registry', () => {
        return giftRegistryPage.createGiftRegistry(locale, publicEventFormData, eventFormShippingData)
            // make the event public
            .then(() => browser.click(giftRegistryPage.BTN_SET_PUBLIC))
            .then(() => browser.waitForVisible(giftRegistryPage.SHARE_OPTIONS))
            .then(visible => assert.isTrue(visible))
            .then(() => navHeader.logout())
    });

    it('should create a private registry', () => {
        return giftRegistryPage.createGiftRegistry(locale, privateEventFormData, eventFormShippingData)
    });

    it('should search for the user and only find 1 public registry', () => {
        return navHeader.logout()
            .then(() => browser.click(footerPage.GIFT_REGISTRY))
            .then(() => browser.waitForVisible(footerPage.GIFT_REGISTRY))
            .then(() => giftRegistryPage.searchGiftRegistry(
                lastName,
                firstName,
                giftRegistryPage.eventType))
            .then(() => giftRegistryPage.getGiftRegistryCount())
            .then(rows => assert.equal(1, rows))
            .then(() => giftRegistryPage.openGiftRegistry())
            .then(() => browser.waitForVisible(giftRegistryPage.BUTTON_FIND));
    });

    it('should login and see both the public and private registries', () => {
        return giftRegistryPage.navigateTo()
            .then(() => loginForm.loginAs(userEmail))
            .then(() => browser.waitForVisible(giftRegistryPage.BTN_CREATE_REGISTRY))
            .then(() => giftRegistryPage.getGiftRegistryCount())
            .then(rows => assert.equal(2, rows));
    });
});
