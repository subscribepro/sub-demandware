'use strict';

import _ from 'lodash';
import * as formHelpers from './helpers/forms/common';

export const AMEX_CREDIT_CARD = '[class*=Amex]';
export const BTN_DELETE_AMEX_CARD = '.Amex .delete';
export const BTN_CANCEL = '.cancel-button';
export const BTN_CREATE_CARD = '#applyBtn';
export const BTN_DELETE_CREDIT_CARD = '[class*=delete]';
export const CREDIT_CARD_SELECTOR = '.payment-list li:nth-of-type(1)';
export const FORM_CREDIT_CARD = 'form[name*=CreditCardForm]';
export const LINK_ADD_CREDIT_CARD = '[class*=add-card]';

const basePath = '/wallet';

export function navigateTo () {
    return browser.url(basePath);
}

export function fillOutCreditCardForm (creditCardData) {
    let fieldsPromise = [];

    let fieldTypes = {
        owner: 'input',
        type: 'selectByValue',
        number: 'input',
        expiration_year: 'selectByValue'
    };

    _.each(creditCardData, (value, key) => {
        let selector = '[name*=newcreditcard_' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, value, fieldTypes[key]));
    });
    return Promise.all(fieldsPromise);
}

export function deleteAllCreditCards () {
    let numOfCCToRemove = 0;
    return browser.elements(BTN_DELETE_CREDIT_CARD)
        .then(removeLinks => {
            numOfCCToRemove = removeLinks.value.length;
            return removeLinks.value.reduce(removeCreditCard => {
                return removeCreditCard.then(() => browser.click(BTN_DELETE_CREDIT_CARD)
                    .then(() => browser.waitUntil(() =>
                        browser.alertText()
                            .then(
                                text => text === 'Do you want to remove this credit card?',
                                err => err.message !== 'no alert open'
                            )
                    ))
                    .then(() => browser.alertAccept())
                    .waitUntil(() => {
                        return browser.elements(BTN_DELETE_CREDIT_CARD)
                            .then(rows => rows.value.length === numOfCCToRemove -1);
                    })
                    .then(() => numOfCCToRemove -= 1)
                );
            }, Promise.resolve());
        });
}
