'use strict';

export const LOGIN_BOX = '.login-box';
export const ERROR_MSG = '.error-form';
export const WISHLIST_FOOTER_LINK = '.menu-footer:nth-of-type(1) li:nth-of-type(3)';
export const GIFTREGISTRY_FOOTER_LINK = '.menu-footer:nth-of-type(1) li:nth-of-type(4)';

const basePath = '/account';

export function navigateTo () {
    return browser.url(basePath);
}
