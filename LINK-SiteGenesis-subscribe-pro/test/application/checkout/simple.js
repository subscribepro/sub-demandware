'use strict';

import _ from 'lodash';
import {assert} from 'chai';

import * as cartPage from '../pageObjects/cart';
import * as checkoutPage from '../pageObjects/checkout';
import * as homePage from '../pageObjects/home';
import * as orderConfPage from '../pageObjects/orderConfirmation';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as formLogin from '../pageObjects/helpers/forms/login';
import * as formHelpers from '../pageObjects/helpers/forms/common';
import * as helpers from '../pageObjects/helpers/common';
import * as navHeader from '../pageObjects/navHeader';
import * as giftCertPage from '../pageObjects/giftCertPurchase';
import {config} from '../webdriver/wdio.conf';
import * as customers from '../pageObjects/testData/customers';


describe('Checkout', () => {
    const successfulCheckoutTitle = 'Thank you for your order.';
    const locale = config.locale;
    const userEmail = config.userEmail;
    let shippingData = {};
    let billingFormData = {};

    before(() =>
        testData.load()
            .then(() => {
                const customer = testData.getCustomerByLogin(userEmail);
                customer.addresses[0].postalCode = customers.globalPostalCode[locale];
                customer.addresses[0].countryCode = customers.globalCountryCode[locale];
                customer.addresses[0].phone = customers.globalPhone[locale];

                let address = customer.getPreferredAddress();

                shippingData = {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    address1: address.address1,
                    country: address.countryCode,
                    city: address.city,
                    postal: address.postalCode,
                    phone: address.phone,
                    addressList: address.addressId
                };

                if (locale && locale === 'x_default') {
                    shippingData.states_state = address.stateCode;
                }

                billingFormData = {
                    postal: address.postalCode,
                    phone: address.phone,
                    emailAddress: customer.email,
                    creditCard_owner: customer.firstName + ' ' + customer.lastName,
                    creditCard_number: testData.creditCard1.number,
                    creditCard_expiration_year: testData.creditCard1.yearIndex,
                    creditCard_cvn: testData.creditCard1.cvn
                };
            })
            .then(() => Promise.resolve())
    );

    function addProductVariationMasterToCart () {
        let product = new Map();
        product.set('resourcePath', testData.getProductVariationMaster().getUrlResourcePath());
        product.set('colorIndex', 1);
        product.set('sizeIndex', 2);
        product.set('widthIndex', 1);

        return productDetailPage.addProductVariationToCart(product);
    }

    describe('Checkout as Guest', () => {
        let shippingFormData;

        before(() => addProductVariationMasterToCart()
            .then(() => {
                // Set form data without preferred address, since manually
                // entering form fields as Guest
                shippingFormData = _.cloneDeep(shippingData);
                delete shippingFormData.addressList;
            })
            .then(() => checkoutPage.navigateTo())
        );

        it('should allow checkout as guest', () =>
            checkoutPage.pressBtnCheckoutAsGuest()
                .then(() => checkoutPage.getActiveBreadCrumb())
                .then(activeBreadCrumb => assert.equal(activeBreadCrumb, 'STEP 1: Shipping'))
        );

        // Fill in Shipping Form
        it('should allow saving of Shipping form when required fields filled', () =>
            checkoutPage.fillOutShippingForm(shippingFormData, locale)
                .then(() => checkoutPage.checkUseAsBillingAddress())
                .then(() => browser.isEnabled(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE))
                .then(savable => assert.ok(savable))
        );

        it('should redirect to the Billing page after Shipping saved', () =>
            browser.click(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE)
                .then(() => checkoutPage.getActiveBreadCrumb())
                .then(activeBreadCrumb => assert.equal(activeBreadCrumb, 'STEP 2: Billing'))
        );

        // This test won't work in January, because of UI limitations barring the selection of a previous year
        // That is why this test contains a conditional skip.
        it('should fill out the billing form with expired credit card information', function () {
            const date = new Date();
            let expiredBillingFormData = _.cloneDeep(billingFormData);
            expiredBillingFormData.creditCard_expiration_year = testData.creditCard1.yearIndex - 1;

            if (!date.getMonth()) {
                this.skip();
            }

            return checkoutPage.fillOutBillingForm(expiredBillingFormData)
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => browser.click(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => browser.waitForExist(checkoutPage.CREDIT_CARD_MONTH_ERROR_MSG))
                .then(doesExist => assert.isTrue(doesExist))
        });

        // Fill in Billing Form
        it('should allow saving of Billing Form when required fields filled', () =>
            checkoutPage.fillOutBillingForm(billingFormData)
                .then(() => browser.waitForExist(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => browser.isEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(enabled => assert.ok(enabled))
        );

        it('should redirect to the Place Order page after Billing saved', () =>
            browser.click(checkoutPage.BTN_CONTINUE_BILLING_SAVE)
                .then(() => checkoutPage.getActiveBreadCrumb())
                .then(activeBreadCrumb => assert.equal(activeBreadCrumb, 'STEP 3: Place Order'))
        );

        it('should enable the Place Order button when Place Order page reached', () =>
            browser.isEnabled(checkoutPage.BTN_PLACE_ORDER)
                .then(enabled => assert.ok(enabled))
        );

        it('should redirect to Order Confirmation page after a successful order submission', () =>
            browser.click(checkoutPage.BTN_PLACE_ORDER)
                .waitForVisible(orderConfPage.ORDER_CONF_DETAILS)
                .then(() => checkoutPage.getLabelOrderConfirmation())
                .then(title => assert.equal(title, successfulCheckoutTitle))
        );
    });

    describe('Checkout as Returning Customer', () => {

        let shippingFormData;
        before(() => addProductVariationMasterToCart()
            .then(() => {
                shippingFormData = _.cloneDeep(shippingData);
                delete shippingFormData.addressList;
            })
            .then(() => checkoutPage.navigateTo())
            .then(() => formLogin.loginAs(userEmail))
        );

        after(() => navHeader.logout());

        it('should allow check out as a returning customer', () => {
            return browser.waitForVisible(checkoutPage.BREADCRUMB_SHIPPING)
                .then(() => checkoutPage.fillOutShippingForm(shippingFormData, locale))
                .then(() => checkoutPage.checkUseAsBillingAddress())
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE, checkoutPage.BREADCRUMB_BILLING))
                .then(() => checkoutPage.fillOutBillingForm(billingFormData))
                .then(() => checkoutPage.uncheckSaveThisCreditCard())
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_PLACE_ORDER, orderConfPage.ORDER_CONF_DETAILS))
                .then(() => checkoutPage.getLabelOrderConfirmation())
                .then(title => assert.equal(title, successfulCheckoutTitle));
        });
    });

    describe('Checkout Gift Certificate as Returning Customer', () => {
        let shippingFormData;
        let giftCertFieldMap = {
            recipient: 'Joe Smith',
            recipientEmail: 'jsmith@someBogusEmailDomain.tv',
            confirmRecipientEmail: 'jsmith@someBogusEmailDomain.tv',
            message: 'Congratulations!',
            amount: '250'
        };
        before(() => homePage.navigateTo()
            .then(() => navHeader.login())
            .then(() => cartPage.emptyCart())
            .then(() => giftCertPage.navigateTo())
            .then(() => giftCertPage.fillOutGiftCertPurchaseForm(giftCertFieldMap))
            .then(() => giftCertPage.pressBtnAddToCart())
            .then(() => {
                shippingFormData = _.cloneDeep(shippingData);
                delete shippingFormData.addressList;
            })
            .then(() => checkoutPage.navigateTo())
        );

        after(() => navHeader.logout());

        it('should allow check out as a returning customer', () => {
            return browser.waitForVisible(checkoutPage.BREADCRUMB_BILLING)
                .then(() => checkoutPage.fillOutBillingForm(billingFormData))
                .then(() => checkoutPage.uncheckSaveThisCreditCard())
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_PLACE_ORDER, orderConfPage.ORDER_CONF_DETAILS))
                .then(() => checkoutPage.getLabelOrderConfirmation())
                .then(title => assert.equal(title, successfulCheckoutTitle));
        });

    });

    describe('Form Editing', () => {
        let shippingFormData;

        before(() => homePage.navigateTo()
            .then(() => navHeader.login())
            .then(() => cartPage.emptyCart())
            .then(() => addProductVariationMasterToCart())
            .then(() => {
                shippingFormData = _.cloneDeep(shippingData);
                delete shippingFormData.addressList;
            })
            .then(() => checkoutPage.navigateTo())
            .then(() => checkoutPage.fillOutShippingForm(shippingFormData,locale))
            .then(() => browser.waitForValue(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE))
            .then(() => checkoutPage.checkUseAsBillingAddress())
            .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE))
            .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE, checkoutPage.BREADCRUMB_BILLING))
            .then(() => checkoutPage.fillOutBillingForm(billingFormData))
            .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
            .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
        );

        after(() =>
            cartPage.emptyCart()
                .then(() => navHeader.logout())
        );

        it('should allow editing of the Order Summary form', () => {
            return browser.click(checkoutPage.LINK_EDIT_ORDER_SUMMARY)
                .then(() => cartPage.updateQuantityByRow(1, 3))
                .then(() => helpers.clickAndWait(cartPage.BTN_CHECKOUT, checkoutPage.BREADCRUMB_SHIPPING))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE, checkoutPage.BREADCRUMB_BILLING))
                .then(() => checkoutPage.fillOutBillingForm(billingFormData))
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
                .then(() => checkoutPage.getQuantityByRow(1))
                .then(updatedQuantity => assert.equal(updatedQuantity, '3'));
        });

        it('should show Shipping Address edits', () => {
            let address2 = 'Suite 100';
            return browser.waitForVisible(checkoutPage.BREADCRUMB_PLACE_ORDER)
                .then(() => helpers.clickAndWait(checkoutPage.LINK_EDIT_SHIPPING_ADDR, checkoutPage.BREADCRUMB_SHIPPING))
                .then(() => formHelpers.populateField('input[id*=address2]', address2, 'input'))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE, checkoutPage.BREADCRUMB_BILLING))
                .then(() => checkoutPage.fillOutBillingForm(billingFormData))
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
                .then(() => browser.getText(checkoutPage.MINI_SHIPPING_ADDR_DETAILS))
                .then(shippingAddr => assert.isAbove(shippingAddr.indexOf(address2), -1));
        });

        it('should show Billing Address edits', () => {
            let address2 = 'Apt. 1234';
            return helpers.clickAndWait(checkoutPage.LINK_EDIT_BILLING_ADDR, checkoutPage.BREADCRUMB_BILLING)
                .then(() => formHelpers.populateField('input[id*=address2]', address2, 'input'))
                .then(() => browser.waitForValue('[id*=address2]', 5000))
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
                .then(() => browser.getText(checkoutPage.MINI_BILLING_ADDR_DETAILS))
                .then(billingAddr => assert.isAbove(billingAddr.indexOf(address2), -1));
        });

        it('should show Payment Method edits', () => {
            let paymentMethodLabel = 'Pay Pal';
            return browser.waitForVisible(checkoutPage.BREADCRUMB_PLACE_ORDER)
                .then(() => helpers.clickAndWait(checkoutPage.LINK_EDIT_PMT_METHOD, checkoutPage.BREADCRUMB_BILLING))
                .then(() => browser.click(checkoutPage.RADIO_BTN_PAYPAL))
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_BILLING_SAVE, checkoutPage.BREADCRUMB_PLACE_ORDER))
                .then(() => browser.getText(checkoutPage.MINI_PMT_METHOD_DETAILS))
                .then(paymentMethod => assert.isAbove(paymentMethod.indexOf(paymentMethodLabel), -1));
        });
    });

    describe('Shipping Methods', () => {
        const productWithOneVariant = '25720074';
        const defaultShippingCost = {
            x_default: '$15.99',
            en_GB: '£15.99',
            fr_FR: '15,99 €',
            it_IT: '€ 15,99',
            jp_JP: '¥ 36 ',
            zh_CN: '¥29.99'
        }
        const expressShippingCost = {
            x_default: '$9.99',
            en_GB: '£9.99',
            fr_FR: '9,99 €',
            it_IT: '€ 9,99',
            jp_JP: '¥ 21',
            zh_CN: '¥15.99'
        }
        let productVariation;
        let resourcePath;
        let locale = config.locale;
        let shippingFormData;

        before(() => {
            return testData.load()
                .then(() => browser.deleteCookie())
                .then(() => testData.getProductById(productWithOneVariant))
                .then(productMaster => {
                    let variantSelection = new Map();
                    productVariation = productMaster;
                    resourcePath = productVariation.getUrlResourcePath();
                    variantSelection.set('resourcePath', resourcePath);
                    variantSelection.set('colorIndex', 1);
                    return productDetailPage.addProductVariationToCart(variantSelection);
                })
                .then(() => {
                    // Set form data without preferred address, since manually
                    // entering form fields as Guest
                    shippingFormData = _.cloneDeep(shippingData);
                    delete shippingFormData.addressList;
                })
                .then(() => checkoutPage.navigateTo())
                .then(() => checkoutPage.pressBtnCheckoutAsGuest())
                .then(() => browser.waitForVisible(checkoutPage.BREADCRUMB_SHIPPING))
                .then(() => checkoutPage.fillOutShippingForm(shippingFormData, locale))
        });

        it('#1 Ground shipping method should be selected by default', () => {
            return browser.isSelected(checkoutPage.RADIO_BTN_SHIPPING_METHOD1)
                .then(val => assert.isTrue(val))
        });

        it('#2 default shipping cost should be displayed properly', () => {
            return browser.getText(checkoutPage.ORDER_SHIPPING_COST)
                .then(shippingCharge => assert.equal(shippingCharge, defaultShippingCost[locale]))//TODO:RAP-4743:add shipping parsing
        });

        it('#3 select 2-Day Express shipping method, shipping cost should be displayed properly', () => {
            return browser.click(checkoutPage.RADIO_BTN_SHIPPING_METHOD2)
                .then(() => {
                    if (browser.isSelected(checkoutPage.RADIO_BTN_SHIPPING_METHOD2) !== 'true') {
                        return browser.click(checkoutPage.RADIO_BTN_SHIPPING_METHOD2)
                    }
                })
                .then(() => checkoutPage.checkUseAsBillingAddress())
                .then(() => browser.click(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE))
                .then(() => checkoutPage.fillOutBillingForm(billingFormData))
                .then(() => browser.waitForExist(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
                .then(() => browser.getText(checkoutPage.ORDER_SHIPPING_COST))
                .then(shippingCharge => assert.equal(shippingCharge, expressShippingCost[locale]))//TODO:RAP-4743:add shipping parsing
        });

        it('#4 should checkout successfully with 2-Day Express shipping method ', () => {
            return browser.click(checkoutPage.BTN_CONTINUE_BILLING_SAVE)
                .then(() => browser.waitUntil(browser.isEnabled(checkoutPage.BTN_PLACE_ORDER)))
                .then(() => browser.click(checkoutPage.BTN_PLACE_ORDER))
                .then(() => browser.waitForVisible(orderConfPage.ORDER_CONF_DETAILS))
                .then(() => checkoutPage.getLabelOrderConfirmation())
                .then(title => assert.equal(title, successfulCheckoutTitle))
                .then(() => browser.getText(checkoutPage.ORDER_SHIPPING_COST))
                .then(shippingCharge => assert.equal(shippingCharge, expressShippingCost[locale]))//TODO:RAP-4743:add shipping parsing
        });
    });

});
