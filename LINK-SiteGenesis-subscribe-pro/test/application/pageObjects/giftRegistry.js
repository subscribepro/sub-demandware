'use strict';

import _ from 'lodash';
import * as formHelpers from './helpers/forms/common';
import * as giftRegistryPage from '../pageObjects/giftRegistry';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as addressPage from '../pageObjects/addressBook';
import * as navHeader from '../pageObjects/navHeader';
import {config} from '../webdriver/wdio.conf';

export const SHARE_LINK = '.share-link';
export const USE_PRE_EVENT = '.usepreevent';
export const BTN_ADD_GIFT_CERT = '[name*=addGiftCertificate]';
export const BTN_EVENT_SET_PARTICIPANTS = '[name*="giftregistry_event_setParticipants"]';
export const BTN_EVENT_ADDRESS_CONTINUE = '[name*="giftregistry_eventaddress_setBeforeAfterAddresses"]';
export const BTN_EVENT_CONFIRM = '[name*="giftregistry_event_confirm"]';
export const BTN_NAV_EVENT = '[name*=giftregistry_navigation_navEvent]';
export const BTN_NAV_PURCHASES = '[name*=giftregistry_navigation_navPurchases]';
export const BTN_NAV_REGISTRY = '[name*=giftregistry_navigation_navRegistry]';
export const BTN_NAV_SHIPPING = '[name*=giftregistry_navigation_navShipping]';
export const BTN_NEW_REGISTRY = '[name*="dwfrm_giftregistry_create"]';
export const BTN_SET_PUBLIC = '[name*="giftregistry_setPublic"]';
export const SHARE_OPTIONS = '[class*="share-options"]';
export const BTN_CREATE_REGISTRY = '[name*="giftregistry_create"]';
export const REGISTRY_HEADING = '.page-content-tab-wrapper h2';
export const REGISTRY_NO_PURCHASES_MSG = '.item-list.gift-reg-purchases tr:nth-of-type(1)';
export const FORM_REGISTRY = 'form[name*="giftregistry_event"]';
export const LINK_REMOVE = '[class*="delete-registry"]';
export const SEARCH_GIFTREGISTRY = 'button[name$="giftregistry_search_search"]';
export const INPUT_LASTTNAME = 'input[name$="registrantLastName"]';
export const INPUT_FIRSTNAME = 'input[name$="registrantFirstName"]';
export const INPUT_EVENTTYPE = 'select[id*="giftregistry_search_simple_eventType"]';
export const ITEM_LIST = '.item-list';
export const ITEM_NAME = '.name';
export const BUTTON_FIND = 'button[value=Find]';
export const LINK_VIEW_GIFTREGISTRY = 'a[href*="giftregistryshow"]';
export const TABLE_GR_ITEMS = 'table[class*="item-list"] tr';
export const firstName = 'Test1';
export const lastName = 'User1';
export const eventType = 'wedding';
export const eventTitle = '.list-title';
export const eventName = 'WEDDING OF THE CENTURY - 3/28/08';
export const buttonPrint = 'button[class=print-page]';
export const GIFT_REGISTRY_PORDUCT_LIST_FORM = 'form[id*=giftregistry]';
export const GIFT_CERT_ADDED_TO_GIFT_REGISTRY = ITEM_LIST  + ' tr:nth-of-type(2) .name';
export const ITEM_ADDED_TO_GIFT_REGISTRY = ITEM_LIST + ' tr:nth-of-type(3) .name';
export const BTN_ADD_PRODUCT_TO_CART = ITEM_LIST + ' tr:nth-of-type(3) [name*=addToCart]';

export const EVENT_TYPE = '[name*=giftregistry_event_type]';
export const EVNET_NAME = '[name*=giftregistry_event_name]';
export const EVENT_STATE = '[name*=giftregistry_event_eventaddress_states_state]';
export const EVENT_TOWN = '[name*=giftregistry_event_town]';
export const PARTICIPANT_ROLE = '[name*=giftregistry_event_participant_role]';
export const PARTICIPANT_FIRST_NAME = '[name*=giftregistry_event_participant_firstName]';
export const PARTICIPANT_LAST_NAME = '[name*=giftregistry_event_participant_lastName]';
export const PARTICIPANT_EMAIL = '[name*=giftregistry_event_participant_email]';
export const COPARTICIPANT_ROLE = '[name*=giftregistry_event_coParticipant_role]';
export const COPARTICIPANT_FIRST_NAME = '[name*=giftregistry_event_coParticipant_firstName]';
export const COPARTICIPANT_LAST_NAME = '[name*=giftregistry_event_coParticipant_lastName]';
export const COPARTICIPANT_EMAIL = '[name*=giftregistry_event_coParticipant_email]';

export const BEFORE_SHIPPING_ID = '[name*=giftregistry_eventaddress_addressBeforeEvent_addressid]';
export const BEFORE_SHIPPING_FIRST_NAME = '[name*=giftregistry_eventaddress_addressBeforeEvent_firstname]';
export const BEFORE_SHIPPING_LAST_NAME = '[name*=giftregistry_eventaddress_addressBeforeEvent_lastname]';
export const BEFORE_SHIPPING_ADDRESS1 = '[name*=giftregistry_eventaddress_addressBeforeEvent_address1]';
export const BEFORE_SHIPPING_CITY = '[name*=giftregistry_eventaddress_addressBeforeEvent_city]';
export const BEFORE_SHIPPING_STATE = '[name*=giftregistry_eventaddress_addressBeforeEvent_states_state]';
export const BEFORE_SHIPPING_ZIP_CODE = '[name*=giftregistry_eventaddress_addressBeforeEvent_postal]';
export const BEFORE_SHIPPING_COUNTRY = '[name*=giftregistry_eventaddress_addressBeforeEvent_country]';
export const BEFORE_SHIPPING_PHONE = '[name*=giftregistry_eventaddress_addressBeforeEvent_phone]';

export const AFTER_SHIPPING_ID = '[name*=giftregistry_eventaddress_addressAfterEvent_addressid]';
export const AFTER_SHIPPING_FIRST_NAME = '[name*=giftregistry_eventaddress_addressAfterEvent_firstname]';
export const AFTER_SHIPPING_LAST_NAME = '[name*=giftregistry_eventaddress_addressAfterEvent_lastname]';
export const AFTER_SHIPPING_ADDRESS1 = '[name*=giftregistry_eventaddress_addressAfterEvent_address1]';
export const AFTER_SHIPPING_CITY = '[name*=giftregistry_eventaddress_addressAfterEvent_city]';
export const AFTER_SHIPPING_STATE = '[name*=giftregistry_eventaddress_addressAfterEvent_states_state]';
export const AFTER_SHIPPING_ZIP_CODE = '[name*=giftregistry_eventaddress_addressAfterEvent_postal]';
export const AFTER_SHIPPING_COUNTRY = '[name*=giftregistry_eventaddress_addressAfterEvent_country]';
export const AFTER_SHIPPING_PHONE = '[name*=giftregistry_eventaddress_addressAfterEvent_phone]';

export const PRODUCT_LIST_ITEM = '.item-list tr:nth-of-type(2) .name';
export const EDIT_DETAILS_LINK = '.item-edit-details a';
export const EDIT_DETAILS_POP_UP = '#QuickViewDialog';
export const UPDATE_BTN = '#add-to-cart';
export const SWATCH_COLOR_VALUE = '.swatches.color .selected-value';
export const SWATCH_SIZE_VALUE = '.swatches.size .selected-value';
export const VIEW_REGISTRY = '.item-list .first .event-details a';
export const QUICK_VIEW_ITEM_NUMBER = '.product-number span';
export const ITEM_NUMBER = '.product-list-item .sku .value';
export const ITEM_COLOR = '.product-list-item div:nth-child(3) .value';
export const ITEM_SIZE = '.product-list-item div:nth-child(4) .value';
export const QUICK_VIEW_ITEM_QUANTITY = 'input[name=Quantity]';
export const DESIRED_QUANTITY = 'form-row option-quantity-desired input[name*=quantity]';

const basePath = '/giftregistry';
const login = config.userEmail;

export function navigateTo () {
    return browser.url(basePath);
}

export function fillOutEventForm (addressFormData) {
    let fieldsPromise = [];

    let fieldTypes = {
        type: 'selectByValue',
        name: 'input',
        date: 'date',
        eventaddress_country: 'selectByValue',
        eventaddress_states_state: 'selectByValue',
        town: 'input',
        participant_role: 'selectByValue',
        participant_firstName: 'input',
        participant_lastName: 'input',
        participant_email: 'input',
        coParticipant_role: 'selectByValue',
        coParticipant_firstName: 'input',
        coParticipant_lastName: 'input',
        coParticipant_email: 'input'

    };

    _.each(addressFormData, (value, key) => {
        let selector = '[name*="event_' + key + '"]';
        fieldsPromise.push(formHelpers.populateField(selector, value, fieldTypes[key]));
    });

    return Promise.all(fieldsPromise);
}

export function fillOutEventShippingForm (addressFormData) {
    let fieldsPromise = [];

    let fieldTypes = {
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

    _.each(addressFormData, (value, key) => {
        let selector = '[name*=giftregistry_eventaddress_addressBeforeEvent_' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, value, fieldTypes[key]));
    });

    return Promise.all(fieldsPromise);
}

export function fillOutAfterEventShippingForm (addressFormData) {
    let fieldsPromise = [];

    let fieldTypes = {
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

    _.each(addressFormData, (value, key) => {
        let selector = '[name*=giftregistry_eventaddress_addressAfterEvent_' + key + ']';
        fieldsPromise.push(formHelpers.populateField(selector, value, fieldTypes[key]));
    });

    return Promise.all(fieldsPromise);
}

/**
 * Redirects the browser to the GiftRegistry page, and
 * delete all the Gift Registry events.
 */
export function emptyAllGiftRegistries() {
    return navigateTo()
        .then(() => browser.waitForVisible(BTN_CREATE_REGISTRY))
        .then(() => browser.elements(LINK_REMOVE))
        .then(removeLinks => {
            // click on all the remove links, one by one, sequentially
            return removeLinks.value.reduce(removeRegistry => {
                return removeRegistry.then(() => browser.click(LINK_REMOVE)
                    .then(() => browser.waitUntil(() =>
                            browser.alertText()
                                .then(
                                    text =>  text === 'Do you want to remove this gift registry?',
                                    err => err.message !== 'no alert open'
                            )
                    ))
                    .then(() => browser.alertAccept()));
            }, Promise.resolve());
        });
}
 /* open the first giftRegistry
 *
 */
export function openGiftRegistry () {
    browser.click(LINK_VIEW_GIFTREGISTRY);
}

export function searchGiftRegistry(lastName, firstName, eventType) {
    //caller should be responsible navigate to the Gift Registry page before calling this function
    return browser.waitForVisible(SEARCH_GIFTREGISTRY)
        .setValue(INPUT_LASTTNAME, lastName)
        .setValue(INPUT_FIRSTNAME, firstName)
        .selectByValue(INPUT_EVENTTYPE, eventType)
        .click(BUTTON_FIND);
}

export function getGiftRegistryCount () {
    return browser.elements(TABLE_GR_ITEMS)
        .then(eventRows => eventRows.value.length - 1);
}

export function createGiftRegistry (locale, eventFormData, eventFormShippingData) {
    return giftRegistryPage.navigateTo()
        .then(() => loginForm.loginAs(login))
        .then(() => browser.waitForVisible(giftRegistryPage.BTN_CREATE_REGISTRY))
        .then(() => browser.click(giftRegistryPage.BTN_CREATE_REGISTRY))
        .then(() => browser.waitForVisible(giftRegistryPage.FORM_REGISTRY))
        .then(() => giftRegistryPage.fillOutEventForm(eventFormData, locale))
        .then(() => browser.click(giftRegistryPage.BTN_EVENT_SET_PARTICIPANTS))
        .then(() => browser.waitForVisible(giftRegistryPage.USE_PRE_EVENT))
        .then(() => giftRegistryPage.fillOutEventShippingForm(eventFormShippingData, locale))
        .then(() => browser.waitForValue('[name*=addressBeforeEvent_phone]'))
        .then(() => browser.click(giftRegistryPage.USE_PRE_EVENT))
        .then(() => browser.waitForVisible(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
        .then(() => browser.click(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
        .then(() => browser.waitForVisible(giftRegistryPage.BTN_EVENT_CONFIRM))
        .then(() => browser.click(giftRegistryPage.BTN_EVENT_CONFIRM))
        .then(() => browser.waitForVisible(giftRegistryPage.REGISTRY_HEADING))
}

export function giftRegistryCleanUp () {
    return giftRegistryPage.navigateTo()
        .then(() => browser.waitForVisible(giftRegistryPage.BTN_CREATE_REGISTRY))
        .then(() => giftRegistryPage.emptyAllGiftRegistries())
        .then(() => addressPage.navigateTo())
        .then(() => addressPage.removeAddresses())
        .then(() => navHeader.logout())
}
