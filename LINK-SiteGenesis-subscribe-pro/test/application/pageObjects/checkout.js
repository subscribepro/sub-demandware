'use strict';

import _ from 'lodash';
import * as common from './helpers/common';
import * as formHelpers from './helpers/forms/common';

export const BREADCRUMB_SHIPPING = '.step-1.active';
export const BREADCRUMB_BILLING = '.step-2.active';
export const BREADCRUMB_PLACE_ORDER = '.step-3.active';
export const BTN_CONTINUE_BILLING_SAVE = 'button[name*="billing_save"]';
export const BTN_CONTINUE_SHIPPING_SAVE = '[name*="shippingAddress_save"]';
export const BTN_PLACE_ORDER = 'button[name*="submit"]';
export const PLACE_ORDER_ITEMS = '.item-list tbody tr';
export const CHECKOUT_PROGRESS = '.checkout-progress-indicator .active';
export const CREDIT_CARD_MONTH_ERROR_MSG = '.month .error-message';
export const CSS_ORDER_SUBTOTAL = '.nav.summary .order-subtotal td:nth-child(2)';
export const CVN_INPUT = 'input[id*=paymentMethods_creditCard_cvn]';
export const ORDER_LEVEL_DISCOUNT_TEXT = '.summary .order-discount';
export const DISCOUNT = ORDER_LEVEL_DISCOUNT_TEXT + ' ' + 'td:nth-child(2)';
export const DISCOVER_CARD = 'option[value*=Discover]';
export const LABEL_ORDER_THANK_YOU = '.confirmation-message h1';
export const MINI_SECTION_SHIPPING_ADDR = '.mini-shipment';
export const MINI_SECTION_BILLING_ADDR = '.mini-billing-address';
export const MINI_SECTION_PMT_METHOD = '.mini-payment-instrument';
export const LINK_EDIT_ORDER_SUMMARY = 'a.section-header-note[href*="cart"]';
export const LINK_EDIT_SHIPPING_ADDR = MINI_SECTION_SHIPPING_ADDR + ' a';
export const LINK_EDIT_BILLING_ADDR = MINI_SECTION_BILLING_ADDR + ' a';
export const LINK_EDIT_PMT_METHOD = MINI_SECTION_PMT_METHOD + ' a';
export const MINI_SHIPPING_ADDR_DETAILS = MINI_SECTION_SHIPPING_ADDR + ' .details';
export const MINI_BILLING_ADDR_DETAILS = MINI_SECTION_BILLING_ADDR + ' .details';
export const MINI_PMT_METHOD_DETAILS = MINI_SECTION_PMT_METHOD + ' .details';
export const ORDER_TOTAL_AMOUNT = '.summary .order-value';
export const ORDER_SUBTOTAL = '.summary .order-subtotal td:nth-child(2)';
export const ORDER_SHIPPING_COST = '.order-shipping td:nth-child(2)';
export const PAYMENT_METHOD_TOTAL = '.minibillinginfo-amount';
export const RADIO_BTN_PAYPAL = 'input[value="PayPal"]';
export const RADIO_BTN_SHIPPING_METHOD1 = '.input-radio[id$="001"]';
export const RADIO_BTN_SHIPPING_METHOD2 = '.input-radio[id$="002"]';
export const SELECT_ADDRESS = '[name*="singleshipping_addressList"]';
export const SELECT_CREDITCARD = '[name*=creditCardList]';
export const USE_AS_BILLING_ADDR = '[name*="shippingAddress_useAsBillingAddress"]';
export const CHECK_BOX_SAVE_THIS_CARD = '#dwfrm_billing_paymentMethods_creditCard_saveCard';
export const SHIPPEDADDRESS = '.order-shipments .address div:nth-child(2)';

const basePath = '/checkout';

export function navigateTo () {
    return browser.url(basePath);
}

export function pressBtnCheckoutAsGuest () {
    return browser.click('[name*="login_unregistered"]')
        .waitForVisible(BREADCRUMB_SHIPPING);
}

export function fillOutShippingForm (shippingData, locale) {
    let fieldTypes = new Map();
    let fieldsPromise = [];
    fieldTypes.set('firstName', 'input');
    fieldTypes.set('lastName', 'input');
    fieldTypes.set('address1', 'input');
    fieldTypes.set('address2', 'input');
    fieldTypes.set('country', 'selectByValue');
    if (locale && locale === 'x_default') {
        fieldTypes.set('states_state', 'selectByValue');
    }
    fieldTypes.set('city', 'input');
    fieldTypes.set('postal', 'input');
    fieldTypes.set('phone', 'input');
    fieldTypes.set('addressList', 'selectByValue');
    _.each(shippingData, (value, key) => {
        let prefix = '[name*=';

        switch (key) {
            case 'addressList':
                prefix += 'singleshipping_';
                break;
            default:
                prefix += 'shippingAddress_addressFields_';
        }

        let selector = prefix + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, value, fieldTypes.get(key)));
    });
    return Promise.all(fieldsPromise);
}

export function fillOutBillingForm (billingFields) {
    let fieldTypes = new Map();
    let fieldsPromise = [];

    fieldTypes.set('postal', {
        type: 'input',
        fieldPrefix: 'billingAddress_addressFields_'
    });

    fieldTypes.set('phone', {
        type: 'input',
        fieldPrefix: 'billingAddress_addressFields_'
    });

    fieldTypes.set('emailAddress', {
        type: 'input',
        fieldPrefix: 'billing_billingAddress_email_'
    });
    fieldTypes.set('creditCard_type', {
        type: 'selectByValue',
        fieldPrefix: 'billing_paymentMethods_'
    });
    fieldTypes.set('creditCard_owner', {
        type: 'input',
        fieldPrefix: 'billing_paymentMethods_'
    });
    fieldTypes.set('creditCard_type', {
        type: 'selectByValue',
        fieldPrefix: 'billing_paymentMethods_'
    });
    fieldTypes.set('creditCard_number', {
        type: 'input',
        fieldPrefix: 'billing_paymentMethods_'
    });
    fieldTypes.set('creditCard_expiration_year', {
        type: 'selectByValue',
        fieldPrefix: 'billing_paymentMethods_'
    });
    fieldTypes.set('creditCard_cvn', {
        type: 'input',
        fieldPrefix: 'billing_paymentMethods_'
    });

    _.each(billingFields, (value, key) => {
        let fieldType = fieldTypes.get(key).type;
        let selector = '[name*=' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, value, fieldType));
    });

    return Promise.all(fieldsPromise);
}

export function checkUseAsBillingAddress () {
    return common.clickCheckbox(USE_AS_BILLING_ADDR);
}

export function uncheckSaveThisCreditCard () {
    return common.uncheckCheckbox(CHECK_BOX_SAVE_THIS_CARD);
}

export function getLabelOrderConfirmation () {
    return browser.getText(LABEL_ORDER_THANK_YOU);
}

export function getActiveBreadCrumb () {
    return browser.waitForExist(CHECKOUT_PROGRESS)
        .getText(CHECKOUT_PROGRESS);
}

export function getOrderSubTotal () {
    return browser.getText(CSS_ORDER_SUBTOTAL);
}

export function getQuantityByRow (rowNum) {
    return browser.getText(PLACE_ORDER_ITEMS + ':nth-child(' + rowNum + ') .item-quantity');
}
