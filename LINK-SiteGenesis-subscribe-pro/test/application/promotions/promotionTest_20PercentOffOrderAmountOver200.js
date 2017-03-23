//  This test can only be run if the promotion 'PromotionTest_20%offOrderAmountOver200' is enabled.
//  Also this promotion only gets applied if a user has selected a credit card as a payment method and
//  the the order total is over '200'.

import {assert} from 'chai';
import * as checkoutPage from '../pageObjects/checkout';
import * as customers from '../pageObjects/testData/customers';
import * as formLogin from '../pageObjects/helpers/forms/login';
import * as helpers from '../pageObjects/helpers/common';
import * as navHeader from '../pageObjects/navHeader';
import * as orderConfPage from '../pageObjects/orderConfirmation';
import * as pricingHelpers from '../pageObjects/helpers/pricing';
import * as productDetailPage from '../pageObjects/productDetail';
import * as products from '../pageObjects/testData/products';
import * as testData from '../pageObjects/testData/main';
import {config} from '../webdriver/wdio.conf';

describe('Promotions - 20% off Order Amount Over 200', () => {
    let billingFormData = {};
    const locale = config.locale;
    const userEmail = config.userEmail;
    let orderAmountTotal;
    let orderDiscount;
    let orderSubtotal;
    let orderTotal;
    let paymentMethodTotalAmount;
    let promotionInfo;
    let resourcePath;
    let shippingFormData = {};
    let variantSelection = new Map();

    before(() => {
        return testData.load()
            .then(() => {
                const customer = testData.getCustomerByLogin(userEmail);
                const address = customer.getPreferredAddress();
                const productVariation = testData.getProductById('82936941');
                const variantIds = productVariation.getVariantProductIds();
                const instance = products.getProduct(testData.parsedData.catalog, variantIds[0]);
                const promotion = testData.getPromotionById('PromotionTest_20%offOrderAmountOver200');

                resourcePath = productVariation.getUrlResourcePath();

                variantSelection.set('resourcePath', resourcePath);
                variantSelection.set('colorIndex', (productVariation.getAttrTypeValueIndex('color', instance.customAttributes.color) + 1));
                variantSelection.set('sizeIndex', (productVariation.getAttrTypeValueIndex('size', instance.customAttributes.size) + 1));

                customer.addresses[0].postalCode = customers.globalPostalCode[locale];
                customer.addresses[0].countryCode = customers.globalCountryCode[locale];
                customer.addresses[0].phone = customers.globalPhone[locale];

                shippingFormData = {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    address1: address.address1,
                    country: address.countryCode,
                    city: address.city,
                    postal: address.postalCode,
                    phone: address.phone
                };

                if (locale && locale === 'x_default') {
                    shippingFormData.states_state = address.stateCode;
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

                promotionInfo = {
                    calloutMsg: promotion.getCalloutMsg(locale),
                    discountThreshold: promotion.getDiscountThreshold(),
                    discountAmount: promotion.getDiscountPercentage()
                };

                return Promise.resolve();
            });
    });

    after(() => navHeader.logout());

    it('should get the promo message on pdp', () =>
        browser.url(resourcePath)
            .getText(productDetailPage.PROMOTION_CALLOUT)
            .then(promoCallOut => assert.equal(promoCallOut, promotionInfo.calloutMsg))
    );

    it('should go through the checkout process until the Place Order Page', () =>
        productDetailPage.addProductVariationToCart(variantSelection)
            .then(() => checkoutPage.navigateTo())
            .then(() => formLogin.loginAs(userEmail))
            .then(() => browser.waitForVisible(checkoutPage.BREADCRUMB_SHIPPING))
            .then(() => checkoutPage.fillOutShippingForm(shippingFormData, locale))
            .then(() => checkoutPage.checkUseAsBillingAddress())
            .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE))
            .then(() => helpers.clickAndWait(checkoutPage.BTN_CONTINUE_SHIPPING_SAVE, checkoutPage.BREADCRUMB_BILLING))
            .then(() => checkoutPage.fillOutBillingForm(billingFormData))
            .then(() => checkoutPage.uncheckSaveThisCreditCard())
            .then(() => browser.waitForEnabled(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
            .then(() => browser.click(checkoutPage.BTN_CONTINUE_BILLING_SAVE))
            .then(() => browser.waitForVisible(checkoutPage.BREADCRUMB_PLACE_ORDER))
            .then(() => browser.isVisible(checkoutPage.BREADCRUMB_PLACE_ORDER))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should check that order amount is above 200', () =>
        browser.getText(checkoutPage.ORDER_TOTAL_AMOUNT)
            .then(amount => orderTotal = amount.replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => assert.isAbove(parseFloat(orderTotal), parseFloat(promotionInfo.discountThreshold)))
    );

    it('should check that the order level discount exists', () =>
        browser.waitForVisible(checkoutPage.ORDER_LEVEL_DISCOUNT_TEXT)
            .then(() => browser.isVisible(checkoutPage.ORDER_LEVEL_DISCOUNT_TEXT))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should check that the calculated price is correct', () =>
        browser.getText(checkoutPage.ORDER_SUBTOTAL)
            .then(subtotal => orderSubtotal = subtotal.replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => browser.getText(checkoutPage.DISCOUNT))
            .then(discountAmount => orderDiscount = discountAmount)
            .then(() => orderDiscount = orderDiscount.replace('-', '').replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => assert.equal(parseFloat(orderSubtotal) * parseInt(promotionInfo.discountAmount) / 100, parseFloat(orderDiscount)))
    );

    it ('should check that payment method amount equals order total amount', () =>
        browser.getText(checkoutPage.ORDER_TOTAL_AMOUNT)
            .then(orderTotal => orderAmountTotal = orderTotal.replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => browser.getText(checkoutPage.PAYMENT_METHOD_TOTAL))
            .then(paymentMethodTotal => paymentMethodTotalAmount = paymentMethodTotal.replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => assert.equal(parseFloat(paymentMethodTotalAmount), parseFloat(orderAmountTotal)))
    );

    it('should place the order and check oder has a discount', () =>
        helpers.clickAndWait(checkoutPage.BTN_PLACE_ORDER, orderConfPage.ORDER_CONF_DETAILS)
            .then(() => browser.isVisible(orderConfPage.ORDER_LEVEL_DISCOUNT_TEXT))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('should check that payment method amount equals order total amount', () =>
        browser.getText(orderConfPage.ORDER_TOTAL_AMOUNT)
            .then(orderTotal => orderAmountTotal = orderTotal.replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => browser.getText(orderConfPage.PAYMENT_METHOD_AMOUNT))
            .then(paymentMethodTotal => paymentMethodTotalAmount = paymentMethodTotal.replace(pricingHelpers.getCurrencySymbol(locale), '').trim())
            .then(() => assert.equal(parseFloat(paymentMethodTotalAmount), parseFloat(orderAmountTotal)))
    );
});
