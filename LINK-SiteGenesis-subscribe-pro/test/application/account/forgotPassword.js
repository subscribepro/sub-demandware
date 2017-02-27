'use strict';

/**
 * Test resetting password with email format
 * TODO:
 * Need to verify the content of the error form and confirmation form
 * Note :
 * For security reason starting SG100.1.0 we no longer indicating the matching email
 * address was found or not, as long as the email format is correct, user will see
 * a "Request to Reset Your Password Received" confirmation dialog. Although nothing will be
 * process if the email address was not found.
 */
import {assert} from 'chai';

import * as accountPage from '../pageObjects/account';
import * as homePage from '../pageObjects/home';
import * as navHeader from '../pageObjects/navHeader';

let goodEmail = 'goodemail@demandware.com';
let badEmail = 'badEmail';

describe('Forgot Password (C147192)', () => {
    before(() => homePage.navigateTo());

    it('#1 should verify that the link exists on the login page', () =>
        browser.waitForVisible(navHeader.USER_INFO_ICON)
            .click(navHeader.USER_INFO_ICON)
            .waitForVisible(navHeader.LINK_LOGIN)
            .click(navHeader.LINK_LOGIN)
            .waitForVisible(accountPage.PASSWORD_RESET_LINK)
            .isExisting(accountPage.PASSWORD_RESET_LINK)
            .then(doesExist => assert.isTrue(doesExist))
    );


    it('#2 should verify that the pop-up appears when you click on it', () =>
        browser.click(accountPage.PASSWORD_RESET_LINK)
            .waitForVisible(accountPage.PASSWORD_DIALOG_SELECTOR)
            .isVisible(accountPage.PASSWORD_DIALOG_SELECTOR)
            .then(visible => assert.isTrue(visible))
    );


    it('#3 should reject improperly formed email addresses', () =>
        browser.waitForVisible(accountPage.PASSWORD_EMAIL_INPUT)
            .then(() => browser.setValue(accountPage.PASSWORD_EMAIL_INPUT, badEmail))
            .click(accountPage.PASSWORD_SEND_BUTTON)
            .waitForVisible(accountPage.PASSWORD_ERROR)
            .isExisting(accountPage.PASSWORD_ERROR)
            .then(doesExist => assert.isTrue(doesExist))
            .click(accountPage.PASSWORD_DIALOG_CLOSE)
    );

    it('#4 should accept valid email addresses', () =>
        browser.click(accountPage.PASSWORD_RESET_LINK)
            .waitForVisible(accountPage.PASSWORD_EMAIL_INPUT)
            .then(() => browser.setValue(accountPage.PASSWORD_EMAIL_INPUT, goodEmail))
            .click(accountPage.PASSWORD_SEND_BUTTON)
            .waitForVisible(accountPage.VALID_PASSWORD_SELECTOR)
            .isExisting(accountPage.VALID_PASSWORD_SELECTOR)
            .then(doesExist => assert.isTrue(doesExist))
    );
});
