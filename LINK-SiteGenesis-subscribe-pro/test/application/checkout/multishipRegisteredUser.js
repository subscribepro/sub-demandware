'use strict';

/*
As a registered user, check out with multishipping
- with newly added address
- with pre-existed address
- with edit address after add
- with edit existing address
- toggle shipping methods
- should save the newly added address in user profile
 */
import {assert} from 'chai';
import * as multiShipPage from '../pageObjects/multiship';
import * as testData from '../pageObjects/testData/main';
import * as Resource from '../../mocks/dw/web/Resource';
import {config} from '../webdriver/wdio.conf';
import * as customers from '../pageObjects/testData/customers';
import * as addressPage from '../pageObjects/addressBook';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as checkoutPage from '../pageObjects/checkout';

describe('Multi Shipping - Registered User - check out with New Addresses', () => {
    let locale = config.locale;
    const thankYouMessage = 'Thank you for your order.';
    const homeAddress = '(Home) 104 Presidential Way, Woburn, MA, 01801';
    const workAddress = '(Work) 91 Middlesex Tpke, Burlington, MA, 01803';
    const login = config.userEmail;
    let shipmentText1 = Resource.msgf('multishippingshipments.shipment','checkout', null, 1);
    let shipmentText2 = Resource.msgf('multishippingshipments.shipment','checkout', null, 2);
    let shipmentText3 = Resource.msgf('multishippingshipments.shipment','checkout', null, 3);
    let shipmentText4 = Resource.msgf('multishippingshipments.shipment','checkout', null, 4);

    let address1 = {};
    let address2 = {};
    let address3 = {};
    let address1Edited = {};
    let address4Edited = {};
    let billingFormData = {};


    before(() => testData.load()
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
            address1Edited = {
                firstName: 'Maroon5Edited',
                lastName: 'RocksEdited',
                address1: '1000 Manchester St Edited',
                city: 'London',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };
            if (locale && locale === 'x_default') {
                address1Edited.states_state = 'MA';
            }
            address3 = {
                address1: '104 Presidential Way'
            }
            address4Edited = {
                firstName: 'Test1',
                lastName: 'User1',
                address1: '91 Middlesex Tpke Edited',
                city: 'Burlington',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };
            if (locale && locale === 'x_default') {
                address4Edited.states_state = 'MA';
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
                postal: customers.globalPostalCode[locale],
                country: address.countryCode,
                phone: customers.globalPhone[locale],
                emailAddress: customer.email,
                creditCard_owner: customer.firstName + ' ' + customer.lastName,
                creditCard_number: testData.creditCard1.number,
                creditCard_expiration_year: testData.creditCard1.yearIndex,
                creditCard_cvn: testData.creditCard1.cvn
            }
            if (locale && locale === 'x_default') {
                billingFormData.states_state = 'MA';
            }
            return Promise.resolve();
        })
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 2, 1))
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 5, 1))
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 3, 1))
        .then(() => multiShipPage.addProductVariationMasterToCart(1, 4, 1))
        .then(() => addressPage.navigateTo())
        .then(() => loginForm.loginAs(login))
        .then(() => browser.waitForVisible(addressPage.LINK_CREATE_ADDRESS))
        .then(() => addressPage.removeAddresses())
        .then(() => multiShipPage.navigateTo())
    );

    after(() => addressPage.removeAddresses()
        .then(() => browser.getText(addressPage.TITLE_ADDRESS_SELECTOR))
        .then(titlesLeft => assert.deepEqual(titlesLeft.sort(), ['Home', 'Work']))
        .then(() => navHeader.logout())
    )

    it('should display multi shipping page after clicking on multi shipping button', () =>
        browser.waitForVisible(multiShipPage.BTN_CHECKOUT_MULTI_SHIP)
            .then(() => browser.click(multiShipPage.BTN_CHECKOUT_MULTI_SHIP))
            .then(() => browser.isExisting(multiShipPage.DIV_MULTISHIP))
            .then(exists => assert.equal(exists, true))
    );

    // TODO: will add assert after RAP-4954 is fixed
    it('should be able to add two new addresses for the first two items in Cart', () =>
        browser.click(multiShipPage.SPAN_EDIT_ADDRESS1)
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => multiShipPage.fillAddressDialog(address1))
            .then(() => browser.click(multiShipPage.BTN_SAVE_POPUP))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
            .then(() => browser.click(multiShipPage.SPAN_EDIT_ADDRESS2))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => multiShipPage.fillAddressDialog(address2))
            .then(() => multiShipPage.checkAddToAddressBook())
            .then(() => browser.click(multiShipPage.BTN_SAVE_POPUP))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
    );

    it('should be able to cancel the Edit existing Address Form', () =>
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

    it('should be able to edit an newly added address', () =>
        browser.click(multiShipPage.SPAN_EDIT_ADDRESS1)
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => multiShipPage.fillAddressDialog(address1Edited))
            .then(() => browser.click(multiShipPage.BTN_SAVE_POPUP))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
    );

    it('should select an existing address from user profile', () =>
        browser.selectByVisibleText(multiShipPage.SELECT_ADDRESS_LIST_3, homeAddress)
            .then(() => browser.selectByVisibleText(multiShipPage.SELECT_ADDRESS_LIST_4, workAddress))

    );

    it('should be able to edit an existing address', () =>
        browser.click(multiShipPage.SPAN_EDIT_ADDRESS4)
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM))
            .then(() => multiShipPage.fillAddressDialog(address4Edited))
            .then(() => browser.click(multiShipPage.BTN_SAVE_POPUP))
            .then(() => browser.waitForVisible(multiShipPage.UI_DIALOG_FORM, 500, true))
            .then(() => browser.isEnabled(multiShipPage.BTN_CHECKOUT_CONTINUE))
            .then(isEnabled => assert.ok(isEnabled))
    );

    it('should display 4 different shipments on Shipping Methods page ', () =>
        browser.click(multiShipPage.BTN_CHECKOUT_CONTINUE)
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_STEP_TWO))
            .then(() => browser.getText(multiShipPage.SHIPPMENT_HEADER_1))
            .then(headerText => assert.equal(headerText, shipmentText1.toUpperCase()))
            .then(() => browser.getText(multiShipPage.SHIPPMENT_HEADER_2))
            .then(headerText => assert.equal(headerText, shipmentText2.toUpperCase()))
            .then(() => browser.getText(multiShipPage.SHIPPMENT_HEADER_3))
            .then(headerText => assert.equal(headerText, shipmentText3.toUpperCase()))
            .then(() => browser.getText(multiShipPage.SHIPPMENT_HEADER_4))
            .then(headerText => assert.equal(headerText, shipmentText4.toUpperCase()))
            .then(() => browser.getText(multiShipPage.SHIPPING_ADDRESSES))
            .then(addresses => {
                assert.isTrue(addresses.indexOf(address1Edited.address1) > -1);
                assert.isTrue(addresses.indexOf(address2.address1) > -1);
                assert.isTrue(addresses.indexOf(address3.address1) > -1);
                assert.isTrue(addresses.indexOf(address4Edited.address1) > -1);
            })
    );

    it('should select shipping methods for shipments then go to billing page', () =>
        browser.selectByIndex(multiShipPage.SHIPPMENT_METHOD_1, 1)
            .then(() => browser.selectByIndex(multiShipPage.SHIPPMENT_METHOD_2, 2))
            .then(() => browser.selectByIndex(multiShipPage.SHIPPMENT_METHOD_3, 0))
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

    it('should place order successfully and confirm shipment with four different addresses', () =>
        browser.click(multiShipPage.BTN_CHECKOUT_CONTINUE)
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_STEP_FOUR))
            .then(() => browser.click(multiShipPage.BTN_CHECKOUT_PLACE_ORDER))
            .then(() => browser.waitForVisible(multiShipPage.CHECKOUT_CONFIRMATION))
            .then(() => checkoutPage.getLabelOrderConfirmation())
            .then(title => assert.equal(title, thankYouMessage))
            .then(() => browser.getText(checkoutPage.SHIPPEDADDRESS))
            .then(addresses => {
                assert.isTrue(addresses.indexOf(address1Edited.address1) > -1);
                assert.isTrue(addresses.indexOf(address2.address1) > -1);
                assert.isTrue(addresses.indexOf(address3.address1) > -1);
                assert.isTrue(addresses.indexOf(address4Edited.address1) > -1);
            })
    );

    it('should find the new address saved in user profile', () =>
        addressPage.navigateTo()
            .then(() => addressPage.getAddressTitles())
            .then(addresses => (assert.isTrue(addresses.indexOf('Hong Kong') > -1)))
    )
})

