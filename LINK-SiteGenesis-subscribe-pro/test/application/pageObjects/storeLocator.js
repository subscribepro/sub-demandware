'use strict';

export const BTN_COUNTRY = 'button[name$="_findbycountry"]';
export const BTN_STATE = 'button[name$="_findbystate"]';
export const BTN_ZIP = 'button[name$="_findbyzip"]';
export const TBL_RESULTS = '#store-location-results';
export const STORES_CLASS = '.pt_store-locator';
export const STORE_FORM_COUNTRY = 'select[name*="storelocator_country"]';
export const STORE_FORM_STATE = 'select[name*="storelocator_state"]';
export const STORE_FORM_RADIUS = 'select[name*="storelocator_maxdistance"]';
export const STORE_FORM_ZIP = 'input[name*="storelocator_postalCode"]';
export const TBL_RESULTS_ROWS = TBL_RESULTS + ' tbody tr';
export const TBL_RESULTS_DETAILS_LINK = '.store-details-link';
export const TBL_RESULTS_DETAILS_MODEL = '.ui-dialog .store-locator-details';
export const RESULTS_TITLE = TBL_RESULTS_DETAILS_MODEL + ' h1';

const basePath = '/stores';

export function navigateTo() {
    return browser.url(basePath);
}

export function getResults () {
    return browser
        .elements(TBL_RESULTS_ROWS);
}

export function getStoreInfo() {
    var storeInfoSelector =  RESULTS_TITLE;
    return browser.getText(storeInfoSelector);
}
