'use strict';

import * as testData from './testData/main';
import * as productDetailPage from './productDetail';
import * as formHelpers from '../pageObjects/helpers/forms/common';
import * as common from './helpers/common';

export const BTN_CHECKOUT_CONTINUE = 'button[name*=save]';
export const BTN_CHECKOUT_MULTI_SHIP = '.shiptomultiplebutton';
export const BTN_CHECKOUT_PLACE_ORDER = 'button[name*=submit]';
export const CHECKOUT_ADDRESS_DROPDOWN = '.select-address';
export const CHECKOUT_ADDRESS_LIST_HELPER = '.shippingaddress select[name*=multishipping_addressSelection]';
export const CHECKOUT_CONFIRMATION = '.confirmation-message';
export const CHECKOUT_SHIPPING_METHOD_HELPER = 'select[name*=shippingOptions_shipments]';
export const CHECKOUT_MULTI_SHIP = '.ship-to-multiple';
export const CHECKOUT_STEP_ONE = '.step-1.active';
export const CHECKOUT_STEP_TWO = '.step-2.active';
export const CHECKOUT_STEP_THREE = '.step-3.active';
export const CHECKOUT_STEP_FOUR = '.step-4.active';
export const SELECT_ADDRESS_LIST = 'select[name*=multishipping_addressSelection]';
export const SELECT_ADDRESS_LIST_1 = '.item-list tr:nth-of-type(1) ' + CHECKOUT_ADDRESS_LIST_HELPER;
export const SELECT_ADDRESS_LIST_2 = '.item-list tr:nth-of-type(2) ' + CHECKOUT_ADDRESS_LIST_HELPER;
export const SELECT_ADDRESS_LIST_3 = '.item-list tr:nth-of-type(3) ' + CHECKOUT_ADDRESS_LIST_HELPER;
export const SELECT_ADDRESS_LIST_4 = '.item-list tr:nth-of-type(4) ' + CHECKOUT_ADDRESS_LIST_HELPER;
export const SHIPPMENT_HEADER_1 = '.checkoutmultishipping table:nth-of-type(1) .section-header';
export const SHIPPMENT_HEADER_2 = '.checkoutmultishipping table:nth-of-type(2) .section-header';
export const SHIPPMENT_HEADER_3 = '.checkoutmultishipping table:nth-of-type(3) .section-header';
export const SHIPPMENT_HEADER_4 = '.checkoutmultishipping table:nth-of-type(4) .section-header';
export const SHIPPMENT_METHOD_1 = '.checkoutmultishipping table:nth-of-type(1) ' + CHECKOUT_SHIPPING_METHOD_HELPER;
export const SHIPPMENT_METHOD_2 = '.checkoutmultishipping table:nth-of-type(2) ' + CHECKOUT_SHIPPING_METHOD_HELPER;
export const SHIPPMENT_METHOD_3 = '.checkoutmultishipping table:nth-of-type(3) ' + CHECKOUT_SHIPPING_METHOD_HELPER;
export const SHIPPING_ADDRESSES = '.item-shipping-address div:nth-of-type(2)';
export const BTN_SAVE_POPUP = 'button[name*=_editAddress_save]';
export const UI_DIALOG_FORM = '.ui-dialog #edit-address-form';
export const DIV_MULTISHIP = '.checkoutmultishipping';
export const BTN_GUEST_CHECKOUT1 = 'button[value="';
export const BTN_GUEST_CHECKOUT2 = '"]';
export const SPAN_EDIT_ADDRESS1 = '.item-list tr:nth-of-type(1) .shippingaddress .edit-address span';
export const SPAN_EDIT_ADDRESS2 = '.item-list tr:nth-of-type(2) .shippingaddress .edit-address span';
export const SPAN_EDIT_ADDRESS4 = '.item-list tr:nth-of-type(4) .shippingaddress .edit-address span';
export const BTN_ADDTOADDRESSBOOK ='[name*=addToAddressBook]';
export const BTN_CANCEL_ADD_ADDRESS = 'button[name*=cancel]';

const basePath = '/checkout';

testData.load();

export function navigateTo () {
    return browser.url(basePath);
}

export function checkAddToAddressBook () {
    return common.clickCheckbox(BTN_ADDTOADDRESSBOOK);
}

export function addProductVariationMasterToCart (num1, num2, num3) {
    let product = new Map();
    product.set('resourcePath', testData.getProductVariationMaster().getUrlResourcePath());
    product.set('colorIndex', num1);
    product.set('sizeIndex', num2);
    product.set('widthIndex', num3);

    return productDetailPage.addProductVariationToCart(product);
}

export function fillAddressDialog (addressFormData) {
    let fieldsPromise = [];

    const fieldTypes = {
        firstName: 'input',
        lastname: 'input',
        address1: 'input',
        city: 'input',
        postal: 'input',
        states_state: 'selectByValue',
        country: 'selectByValue',
        phone: 'input'
    };

    Object.keys(addressFormData).forEach(key => {
        const selector = '[name*=multishipping_editAddress_addressFields_' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, addressFormData[key], fieldTypes[key]));
    });

    return Promise.all(fieldsPromise);
}

export function fillOutBillingFormMSGuest (addressFormData) {
    let fieldsPromise = [];

    const fieldTypes = {
        firstName: 'input',
        lastName: 'input',
        address1: 'input',
        city: 'input',
        postal: 'input',
        country: 'selectByValue',
        states_state: 'selectByValue',
        phone: 'input',
        emailAddress: 'input',
        creditCard_owner: 'input',
        creditCard_number: 'input',
        creditCard_expiration_year: 'selectByValue',
        creditCard_cvn: 'input'
    };

    Object.keys(addressFormData).forEach(key => {
        const selector = '[name*=' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, addressFormData[key], fieldTypes[key]));
    });

    return Promise.all(fieldsPromise);
}

