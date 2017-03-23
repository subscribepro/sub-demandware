'use strict';

import {assert} from 'chai';
import * as formLogin from '../pageObjects/helpers/forms/login';
import * as multiShipPage from '../pageObjects/multiship';
import * as testData from '../pageObjects/testData/main';
import * as Resource from '../../mocks/dw/web/Resource';
import * as navHeader from '../pageObjects/navHeader';
import {config} from '../webdriver/wdio.conf';
import * as customers from '../pageObjects/testData/customers';
import * as checkoutPage from '../pageObjects/checkout';

describe('Multi Shipping - Registered User', () => {
    const login = config.userEmail;
    let billingFormData = {};
    let locale = config.locale;
    let shipmentText1 = Resource.msgf('multishippingshipments.shipment','checkout', null, 1);
    let shipmentText2 = Resource.msgf('multishippingshipments.shipment','checkout', null, 2);

    before(() => testData.load()
        .then(() => {
            const customer = testData.getCustomerByLogin(login);
            billingFormData = {
                postal: customers.globalPostalCode[locale],
                phone: customers.globalPhone[locale],
                emailAddress: customer.email,
                creditCard_type: testData.creditCard1.cardType,
                creditCard_owner: customer.firstName + ' ' + customer.lastName,
                creditCard_number: testData.creditCard1.number,
                creditCard_expiration_year: testData.creditCard1.yearIndex,
                creditCard_cvn: testData.creditCard1.cvn
            };

            return Promise.resolve();
        })
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 2, 1))
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 5, 1))
        .then(() => multiShipPage.navigateTo())
        .then(() => formLogin.loginAs(login))
    );

    after(() => navHeader.logout());

    it('should be on the checkout page', () =>
        browser.waitForVisible(multiShipPage.CHECKOUT_MULTI_SHIP)
        .then(() => browser.isVisible(multiShipPage.CHECKOUT_MULTI_SHIP))
        .then(visible => assert.isTrue(visible))
    );

    it('should go to multi shipping page then select addresses', () =>
        browser.click(multiShipPage.BTN_CHECKOUT_MULTI_SHIP)
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_ADDRESS_DROPDOWN))
            .then(() => browser.selectByIndex(multiShipPage.SELECT_ADDRESS_LIST_1, 1))
            .then(() => browser.selectByIndex(multiShipPage.SELECT_ADDRESS_LIST_2, 2))
            .then(() => browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE))
            .then(enabled => assert.isTrue(enabled))
    );

    it('should go to shipping methods then make sure shipment one exists', () =>
        browser.click(multiShipPage.BTN_CHECKOUT_CONTINUE)
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_STEP_TWO))
            .then(() => browser.getText(multiShipPage.SHIPPMENT_HEADER_1))
            .then(headerText => assert.equal(headerText, shipmentText1.toUpperCase()))
    );

    it('should check that shipment two exists', () =>
        browser.getText(multiShipPage.SHIPPMENT_HEADER_2)
            .then(headerText => assert.equal(headerText, shipmentText2.toUpperCase()))
    );

    it('should select shipping methods for shipments then go to billing page', () =>
        browser.selectByIndex(multiShipPage.SHIPPMENT_METHOD_1, 1)
            .then(() => browser.selectByIndex(multiShipPage.SHIPPMENT_METHOD_2, 2))
            .then(() => browser.click(multiShipPage.BTN_CHECKOUT_CONTINUE))
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_STEP_THREE))
            .then(() => browser.isVisible(multiShipPage.CHECKOUT_STEP_THREE))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should fill out the billing form', () =>
        checkoutPage.fillOutBillingForm(billingFormData)
            .then(() => browser.waitUntil(() =>
                browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE)
                    .then(enabled => enabled === true)
            ))
            .then(() => checkoutPage.uncheckSaveThisCreditCard())
            .then(() => browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE))
            .then(enabled => assert.isTrue(enabled))
    );

    it('should place order', () =>
        browser.click(multiShipPage.BTN_CHECKOUT_CONTINUE)
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_STEP_FOUR))
            .then(() => browser.click(multiShipPage.BTN_CHECKOUT_PLACE_ORDER))
            .then(() => browser.isVisible(multiShipPage.CHECKOUT_CONFIRMATION))
            .then(doesExist => assert.isTrue(doesExist))
    );
});
