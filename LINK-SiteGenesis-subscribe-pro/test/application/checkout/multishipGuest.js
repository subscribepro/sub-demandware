'use strict';

import {assert} from 'chai';
import * as multiShipPage from '../pageObjects/multiship';
import * as testData from '../pageObjects/testData/main';
import * as Resource from '../../mocks/dw/web/Resource';
import {config} from '../webdriver/wdio.conf';
import * as cartPage from '../pageObjects/cart';
import * as customers from '../pageObjects/testData/customers';
import * as checkoutPage from '../pageObjects/checkout';

describe('Multi Shipping - Guest User', () => {

    const login = config.userEmail;
    const locale = config.locale;
    const thankYouMessage = 'Thank you for your order.';
    const buttonText = multiShipPage.BTN_GUEST_CHECKOUT1 + Resource.msg('checkoutlogin.checkoutguestbutton', 'checkout', null)
        + multiShipPage.BTN_GUEST_CHECKOUT2;
    const shipmentText1 = Resource.msgf('multishippingshipments.shipment', 'checkout', null, 1);
    const shipmentText2 = Resource.msgf('multishippingshipments.shipment', 'checkout', null, 2);
    let address1 = {};
    let address2 = {};
    let billingFormData = {};


    before (() => testData.load()
        .then(() => {
            const customer = testData.getCustomerByLogin(login);
            const address = customer.getPreferredAddress();

            customer.addresses[0].postalCode = customers.globalPostalCode[locale];
            customer.addresses[0].countryCode = customers.globalCountryCode[locale];
            customer.addresses[0].phone = customers.globalPhone[locale];

            address1 = {
                firstName: 'Maroon5',
                lastName: 'Rocks',
                address1: '1000 Manchester St',
                city: 'London',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };
            if (locale && locale === 'x_default') {
                address1.states_state = 'MA';
            }
            address2 = {
                firstName: 'Bruce ',
                lastName: 'Lee',
                address1: '50 Soy Street',
                city: 'Hong Kong',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };
            if (locale && locale === 'x_default') {
                address2.states_state = 'MA';
            }
            billingFormData = {
                firstName: 'A3',
                lastName: 'A3',
                address1: 'A3',
                city: 'A3',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone,
                emailAddress: customer.email,
                creditCard_owner: customer.firstName + ' ' + customer.lastName,
                creditCard_number: testData.creditCard1.number,
                creditCard_expiration_year: testData.creditCard1.yearIndex,
                creditCard_cvn: testData.creditCard1.cvn
            };

            if (locale && locale === 'x_default') {
                billingFormData.states_state = 'MA';
            }
            return Promise.resolve();
        })
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 2, 1))
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 5, 1))
        .then(() => cartPage.navigateTo())
        .then(() => browser.waitForVisible(cartPage.BTN_CHECKOUT))
        .then(() => browser.click(cartPage.BTN_CHECKOUT))
        .then(() => browser.waitForVisible(buttonText))
        .then(() => browser.click(buttonText))
    );

    it('should display the link to start multiship and lead the user to the multiship shipping page.', () =>
        browser.waitForVisible(multiShipPage.BTN_CHECKOUT_MULTI_SHIP)
            .then(() => browser.click(multiShipPage.BTN_CHECKOUT_MULTI_SHIP))
            .then(() => browser.isExisting(multiShipPage.DIV_MULTISHIP))
            .then(exists => assert.equal(exists, true))
    );

    it('should be able to cancel the Add New Address Form', () =>
        browser.click(multiShipPage.SPAN_EDIT_ADDRESS1)
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => browser.click(multiShipPage.BTN_CANCEL_ADD_ADDRESS))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
            .isVisible(multiShipPage.UI_DIALOG_FORM)
            .then(visible => assert.isFalse(visible))
            .then(() => browser.waitForVisible(multiShipPage.SPAN_EDIT_ADDRESS1))
            .isVisible(multiShipPage.SPAN_EDIT_ADDRESS1)
            .then(visible => assert.isTrue(visible))
    )

    it('should display pop up for entering an address after clicking on the first "add/edit address" span.', () =>
        browser.click(multiShipPage.SPAN_EDIT_ADDRESS1)
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => multiShipPage.fillAddressDialog(address1))
            .then(() => browser.click(multiShipPage.BTN_SAVE_POPUP))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
            .then(() => browser.click(multiShipPage.SPAN_EDIT_ADDRESS2))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => multiShipPage.fillAddressDialog(address2))
            .then(() => browser.click(multiShipPage.BTN_SAVE_POPUP))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
            .then(() => browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE))
            .then(isEnabled => assert.ok(isEnabled))
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
        multiShipPage.fillOutBillingFormMSGuest(billingFormData)
            .then(() => browser.waitUntil(() =>
                browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE)
                    .then(enabled => enabled === true)
            ))
            .then(() => browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE))
            .then(enabled => assert.isTrue(enabled))
    );

    it('should shipped to two different addresses', () =>
        browser.click(multiShipPage.BTN_CHECKOUT_CONTINUE)
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_STEP_FOUR))
            .then(() => browser.click(multiShipPage.BTN_CHECKOUT_PLACE_ORDER))
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_CONFIRMATION))
            .then(() => checkoutPage.getLabelOrderConfirmation())
            .then(title => assert.equal(title, thankYouMessage))
            .then(() => browser.getText(checkoutPage.SHIPPEDADDRESS))
            .then(addresses => {
                assert.equal(addresses[0], address1.address1);
                assert.equal(addresses[1], address2.address1);
            })
    );

});
