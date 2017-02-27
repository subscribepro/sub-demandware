'use strict';

import * as formHelpers from './helpers/forms/common';
import _ from 'lodash';

export const BTN_ADD_TO_CART = '#AddToBasketButton';
export const INPUT_FROM_FIELD = 'input[id$="giftcert_purchase_from"]';

const basePath = '/giftcertpurchase';

export function navigateTo () {
    return browser.url(basePath);
}

export function pressBtnAddToCart () {
    return browser.click(BTN_ADD_TO_CART);
}

export function fillOutGiftCertPurchaseForm (giftCertPurchaseFields) {
    let fieldsPromise = [];
    let fieldMap = {
        recipient: {
            type: 'input',
            fieldSuffix: 'giftcert_purchase_recipient'
        },
        recipientEmail: {
            type: 'input',
            fieldSuffix: 'giftcert_purchase_recipientEmail'
        },
        confirmRecipientEmail: {
            type: 'input',
            fieldSuffix: 'giftcert_purchase_confirmRecipientEmail'
        },
        message: {
            type: 'input',
            fieldSuffix: 'purchase_message'
        },
        amount: {
            type: 'input',
            fieldSuffix: 'purchase_amount'
        }
    };
    _.each(giftCertPurchaseFields, (value, key) => {
        var selector = '[id$=' + fieldMap[key].fieldSuffix + ']';
        fieldsPromise.push(formHelpers.populateField(selector, value.toString()));
    });
    return Promise.all(fieldsPromise);
}
