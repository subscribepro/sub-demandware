'use strict';

import {assert} from 'chai';
import * as paymentSettingsPage from '../pageObjects/paymentSettings';
import * as testData from '../pageObjects/testData/main';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as Resource from '../../mocks/dw/web/Resource';
import {config} from '../webdriver/wdio.conf';

describe('Payment Settings', () => {
    let amexCardData = {};
    let customer;
    let login = config.userEmail;

    before(() => testData.load()
        .then(() => {
            customer = testData.getCustomerByLogin(login);
            amexCardData = {
                owner: customer.firstName + ' ' + customer.lastName,
                type: 'Amex',
                number: '371449635398431',
                expiration_year: testData.creditCard1.yearIndex
            };
            return Promise.resolve();
        })
        .then(() => paymentSettingsPage.navigateTo())
        .then(() => loginForm.loginAs(login))
        .then(() => browser.waitForVisible(paymentSettingsPage.LINK_ADD_CREDIT_CARD))
    );


    after(() => navHeader.logout());

    it('should bring up the new credit card form', () =>
        browser.click(paymentSettingsPage.LINK_ADD_CREDIT_CARD)
            .waitForVisible(paymentSettingsPage.FORM_CREDIT_CARD)
            .isVisible(paymentSettingsPage.FORM_CREDIT_CARD)
            .then(visible => assert.isTrue(visible))
    );

    it('should click the cancel button and close the form', () =>
        browser.click(paymentSettingsPage.BTN_CANCEL)
            .then(() => browser.waitForVisible(paymentSettingsPage.FORM_CREDIT_CARD, 500, true))
            .isVisible(paymentSettingsPage.FORM_CREDIT_CARD)
            .then(visible => assert.isFalse(visible))
            .then(() => browser.waitForVisible(paymentSettingsPage.LINK_ADD_CREDIT_CARD))
            .then(() => browser.isVisible(paymentSettingsPage.LINK_ADD_CREDIT_CARD))
            .then(visible => assert.isTrue(visible))
    );

    it('should bring up the new credit card and fill out form to add an Amex Card', () => {
        let expiration = testData.creditCard1.yearIndex;
        let deleteCard = Resource.msg('account.paymentinstrumentlist.deletecard', 'account', null);
        return browser.click(paymentSettingsPage.LINK_ADD_CREDIT_CARD)
            .then(() => browser.waitForVisible(paymentSettingsPage.FORM_CREDIT_CARD))
            .then(() => browser.isVisible(paymentSettingsPage.FORM_CREDIT_CARD))
            .then(visible => assert.isTrue(visible))
            .then(() => paymentSettingsPage.fillOutCreditCardForm(amexCardData))
            .then(() => browser.click(paymentSettingsPage.BTN_CREATE_CARD))
            .then(() => browser.waitForVisible(paymentSettingsPage.AMEX_CREDIT_CARD))
            .then(() => browser.getText(paymentSettingsPage.AMEX_CREDIT_CARD))
            .then(displayText => assert.equal(displayText, `${customer.firstName} ${customer.lastName}\nAmex\n***********8431\nExp. 01.${expiration}\n` + deleteCard));
    });

    it('should delete all of the credit Cards', () =>
        paymentSettingsPage.deleteAllCreditCards()
            .then(() => browser.waitUntil(() =>
                browser.isExisting(paymentSettingsPage.CREDIT_CARD_SELECTOR)
                    .then(doesExist => doesExist === false)
            ))
            .then(() => browser.isExisting(paymentSettingsPage.CREDIT_CARD_SELECTOR))
            .then(doesExist => assert.isFalse(doesExist))
    );
});
