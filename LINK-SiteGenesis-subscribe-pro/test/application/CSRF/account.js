/**
 * RAP-4867: when CSRF token is changed for the following form, validate a expected message is displayed
 * AddAddress
 * addCreditCard
 * editAddress
 */

/**
 * Requirement : Home and Work addresses for the test user should be available before test starts
 */
import {assert} from 'chai';
import * as addressPage from '../pageObjects/addressBook';
import * as testData from '../pageObjects/testData/main';
import * as loginForm from '../pageObjects/helpers/forms/login';
import {config} from '../webdriver/wdio.conf';
import * as customers from '../pageObjects/testData/customers';
import * as Resource from '../../mocks/dw/web/Resource';


describe('CSRF Protection - Address', () => {
    if (config.coverage !== 'regression') {
        return;
    }
    let login = config.userEmail;
    let locale = config.locale;

    let addressFormData = {};
    let editAddressFormData = {};

    before(() => testData.load()
        .then(() => {
            const customer = testData.getCustomerByLogin(login);
            const address = customer.getPreferredAddress();

            customer.addresses[0].postalCode = customers.globalPostalCode[locale];
            customer.addresses[0].countryCode = customers.globalCountryCode[locale];
            customer.addresses[0].phone = customers.globalPhone[locale];

            addressFormData = {
                addressid: 'ZZZZZ Test Address',
                firstname: 'The Muffin',
                lastname: 'Mann',
                address1: '211 Drury Lane',
                city: 'Far Far Away',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };
            if (locale && locale === 'x_default') {
                addressFormData.states_state = address.stateCode;
            }

            editAddressFormData = {
                addressid: 'Test Address Edited',
                firstname: 'The Muffin',
                lastname: 'Mann',
                address1: '211 Drury Lane',
                city: 'Far Far Away',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };
            if (locale && locale === 'x_default') {
                editAddressFormData.states_state = address.stateCode;
            }
        })
        .then(() => addressPage.navigateTo())
        .then(() => loginForm.loginAs(login))
        .then(() => browser.waitForVisible(addressPage.LINK_CREATE_ADDRESS))
        .then(() => addressPage.removeAddresses())

    );

    it('should get a CSRF token mismatch message', () => {
        let csrfErrorMessage = Resource.msgf('global.csrf.failed.heading', 'locale', null);
        return browser.click(addressPage.LINK_CREATE_ADDRESS)
            .then(() => browser.waitForVisible(addressPage.FORM_ADDRESS))
            .then(() => browser.isVisible(addressPage.FORM_ADDRESS))
            .then(visible => assert.isTrue(visible))
            .then(() => addressPage.fillAddressForm(addressFormData))
            .then(() => browser.execute(() => {
                const selector = '[name = csrf_token]';
                return document.querySelector(selector).value = '1234fgdhej'
            }))
            .then(() => browser.click(addressPage.BTN_FORM_CREATE))
            .getText('h1')
            .then(displayText => assert.equal(displayText, csrfErrorMessage));
    });
});
