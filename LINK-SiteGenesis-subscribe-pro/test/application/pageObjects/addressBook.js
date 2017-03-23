'use strict';

import * as formHelpers from './helpers/forms/common';

export const ADDRESS_SELECTOR = '.address-list li';
export const BTN_EDIT_ADDRESS = 'button[name*=address_edit]';
export const BTN_FORM_CREATE = 'button[name*=create]';
export const ERROR_CITY = '[id*=city-error]';
export const ERROR_ADDRESSID = '[id*=addressid-error]';
export const FIRST_ADDRESS_TITLE = '.default .mini-address-title';
export const FORM_ADDRESS = '.ui-dialog';
export const INPUT_ADDRESSID = 'input[name*=addressid]';
export const INPUT_CITY = 'input[name*=city]';
export const LAST_ADDRESS_TITLE = '.address-tile:last-of-type .mini-address-title';
export const LINK_CREATE_ADDRESS = '.address-create';
export const MAKE_DEFAULT_ADDRESS = '.address-tile:last-of-type .address-make-default';
export const MAKE_LAST_DEFAULT_ADDRESS = '.address-tile:last-of-type .address-make-default';
export const TITLE_ADDRESS_SELECTOR = '.address-list li .mini-address-title';

const basePath = '/addressbook';

export function navigateTo () {
    return browser.url(basePath);
}

export function fillAddressForm (addressFormData) {
    let fieldsPromise = [];

    const fieldTypes = {
        addressid: 'input',
        firstname: 'input',
        lastname: 'input',
        address1: 'input',
        city: 'input',
        postal: 'input',
        states_state: 'selectByValue',
        country: 'selectByValue',
        phone: 'input'
    };

    Object.keys(addressFormData).forEach(key => {
        const selector = '[name*=profile_address_' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, addressFormData[key], fieldTypes[key]));
    });

    return Promise.all(fieldsPromise);
}

export function getAddressTitles () {
    // This assumes that the client is already on the My Account > Addresses page
    return browser.getText(TITLE_ADDRESS_SELECTOR);
}

export function removeAddresses () {
    const defaultAddresses = ['Home', 'Work'];

    // get all address titles
    return browser.getText('.address-tile .mini-address-title')
        .then(addressTexts => {
            // filter out Home and Work addresses
            return addressTexts.filter(function (addressText) {
                return defaultAddresses.indexOf(addressText) === -1;
            });
        })
        // remove addresses sequentially
        .then(addressTextsToRemove => {
            return addressTextsToRemove.reduce((removeTask, addressText, addressToRemoveIndex) => {
                return removeTask.then(() => {
                    // look at all address tiles, find the one with the address title that matches `addressText`
                    return browser.elements('.address-tile')
                        .then(res => {
                            return new Promise(resolve => {
                                // loop through all address tiles
                                res.value.forEach((addressTile, tileIndex) => {
                                    // find the text of the address title by finding the element ID of the address title first
                                    browser.getText('.address-tile:nth-of-type(' + (tileIndex + 1) + ') .mini-address-title')
                                        .then(addressTitle => {
                                            if (addressTitle === addressText) {
                                                resolve(tileIndex);
                                            }
                                        });
                                });
                            });
                        })
                        // once the element ID of the address tile to be deleted is found, proceed to delete it
                        .then(tileIndex => {
                            return browser.click('.address-tile:nth-of-type(' + (tileIndex + 1) + ') .delete')
                                .alertAccept()
                                // wait until the address is removed, i.e.
                                // there is one less addresses to be removed
                                .waitUntil(() => {
                                    return hasAddressCount(defaultAddresses.length + addressTextsToRemove.length - (addressToRemoveIndex + 1))
                                });
                        });
                });
            }, Promise.resolve());
        })
        // make sure there are only default addresses left
        .then(() => browser.waitUntil(() => {
            return hasAddressCount(defaultAddresses.length);
        }));
}

function hasAddressCount (n) {
    return browser.elements(ADDRESS_SELECTOR)
        .then(rows => rows.value.length === n);
}

/**
 * edit the address title from origialAddress to something defined in editAddressFormData
 * @param originalAddress
 * @param editAddressFormData
 * @returns {Promise.}
 */
export function editAddress(originalAddress, editAddressFormData) {
    // get all address titles
    return browser.getText(TITLE_ADDRESS_SELECTOR)
        .then(addressTexts => {
            // filter out Home and Work addresses
            return addressTexts.filter(function (addressText) {
                return addressText === originalAddress;
            });
        })
        .then((addressToEdit) => browser.element('li*=' + addressToEdit))
        .click('.address-edit')
        .then(() => browser.waitForVisible(FORM_ADDRESS))
        .then(() => fillAddressForm(editAddressFormData))
        .then(() => browser.click(BTN_EDIT_ADDRESS))
        .waitForVisible(FORM_ADDRESS, 500, true);
}
