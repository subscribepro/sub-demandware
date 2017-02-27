import {assert} from 'chai';
import * as accountPage from '../pageObjects/account';
import * as testData from '../pageObjects/testData/main';
import * as accountForm from '../pageObjects/helpers/forms/account';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as navHeader from '../pageObjects/navHeader';
import * as Resource from '../../mocks/dw/web/Resource';
import {config} from '../webdriver/wdio.conf';

describe('Profile', () => {
    let customer;
    let login = config.userEmail;
    let newFirstName = 'Diamonique';
    let newLastName = 'Kerfluffle';

    before(() => {
        return testData.load()
            .then(() => customer = testData.getCustomerByLogin(login))
            .then(() => accountPage.navigateTo())
            .then(() => loginForm.loginAs(login));
    });

    after(() => navHeader.logout());

    describe('Editing', () => {
        before(() => {
            return browser.click(accountPage.PERSONAL_DATA)
                .waitForValue(accountForm.FIELD_EMAIL);
        });

        it('should pre-populate the first name field', () => {
            return browser.getValue(accountForm.FIELD_FIRST_NAME)
                .then(firstName => assert(firstName, customer.firstName));
        });

        it('should pre-populate the last name field', () => {
            return browser.getValue(accountForm.FIELD_LAST_NAME)
                .then(lastName => assert(lastName, customer.lastName));
        });

        it('should pre-populate the email field', () => {
            return browser.getValue(accountForm.FIELD_EMAIL)
                .then(lastName => assert(lastName, customer.email));
        });

        it('should allow editing of the name fields', () => {
            let newValues = {};
            newValues[accountForm.FIELD_FIRST_NAME] = newFirstName;
            newValues[accountForm.FIELD_LAST_NAME] = newLastName;
            // Required fields
            newValues[accountForm.FIELD_EMAIL] = customer.email;
            newValues[accountForm.FIELD_EMAIL_CONFIRM] = customer.email;
            newValues[accountForm.FIELD_PASSWORD] = testData.defaultPassword;

            let oldValues = {};
            oldValues[accountForm.FIELD_FIRST_NAME] = customer.firstName;
            oldValues[accountForm.FIELD_LAST_NAME] = customer.lastName;
            // Required fields
            oldValues[accountForm.FIELD_EMAIL] = customer.email;
            oldValues[accountForm.FIELD_EMAIL_CONFIRM] = customer.email;
            oldValues[accountForm.FIELD_PASSWORD] = testData.defaultPassword;

            return accountForm.editAccount(newValues)
                .then(() => browser.waitForVisible('.account-options'))
                .then(() => browser.getText(accountForm.ACCOUNT_HEADER))
                // Test
                .then(accountHeader => assert.isTrue(accountHeader.indexOf(`${newFirstName} ${newLastName}`) > -1))
                // Reset values
                .then(() => browser.click(accountPage.PERSONAL_DATA))
                .then(() => accountForm.editAccount(oldValues));
        });

        it('should prevent updating an email address to one taken by another user', () => {
            // Acceptable values for locale are fr_FR, it_IT, ja_JP, and zh_CN
            let locale = '';
            let bundleName = locale ? `forms_${locale}` : 'forms';
            let expectedError = Resource.msgf('profile.usernametaken', bundleName, null, 1);
            let emails = ['testuser1@demandware.com', 'testuser2@demandware.com','testuser3@demandware.com'];
            let result = emails.filter(function(user) {
                return user !== login;
            })
            let newEmail = result[0];
            let newValues = {};
            newValues[accountForm.FIELD_EMAIL] = newEmail;
            newValues[accountForm.FIELD_EMAIL_CONFIRM] = newEmail;
            newValues[accountForm.FIELD_PASSWORD] = testData.defaultPassword;

            return browser.click(accountPage.PERSONAL_DATA)
                .waitForValue(accountForm.FIELD_EMAIL)
                .then(() => accountForm.editAccount(newValues))
                .then(() => browser.getText(accountForm.ERROR_EMAIL_ALREADY_TAKEN))
                .then(error => assert.equal(error, expectedError))
                .then(() => accountPage.navigateTo());
        });

        it('should display the error message when incorrect current password is used to update users data', () => {
            // Acceptable values for locale are fr_FR, it_IT, ja_JP, and zh_CN
            let locale = '';
            let bundleName = locale ? `forms_${locale}` : 'forms';
            let expectedError = Resource.msgf('profile.currentpasswordnomatch', bundleName, null, 1);
            let newEmail = config.userEmail;
            let invalidPassword = 'invalidPassword';
            let newValues = {};

            newValues[accountForm.FIELD_EMAIL] = newEmail;
            newValues[accountForm.FIELD_EMAIL_CONFIRM] = newEmail;
            newValues[accountForm.FIELD_PASSWORD] = invalidPassword;

            return browser.click(accountPage.PERSONAL_DATA)
                .then(() => browser.waitForExist(accountForm.FIELD_EMAIL))
                .then(() => accountForm.editAccount(newValues))
                .then(() => browser.getText(accountForm.ERROR_EMAIL_ALREADY_TAKEN))
                .then(error => assert.equal(error, expectedError))
                .then(() => accountPage.navigateTo());

        });

        it('should display the error message when the confirm new password does not match the new password', () => {
            let locale = '';
            let bundleName = locale ? `forms_${locale}` : 'forms';
            let expectedError = Resource.msgf('profile.currentpasswordnomatch', bundleName, null, 1);
            let invalidPassword = 'invalidPassword';
            let newValues = {};

            newValues[accountForm.FIELD_CURRENTPASSWORD] = invalidPassword;
            newValues[accountForm.FIELD_NEWPASSWORD] = invalidPassword;
            newValues[accountForm.FIELD_NEWPASSWORDCONFIRM] = invalidPassword;

            return browser.click(accountPage.PERSONAL_DATA)
                .then(() => browser.waitForExist(accountForm.FIELD_EMAIL))
                .then(() => accountForm.changePassword(newValues))
                .then(() => browser.getText(accountForm.ERROR_INVALID_PASSWORD))
                .then(error => assert.equal(error, expectedError))
                .then(() => accountPage.navigateTo());
        });

        it('should allow for the form to be submitted with a new password', () => {
            let currentPassword = 'Test123!';
            let newPassword = 'qwertyuiop';
            let newValues = {};


            newValues[accountForm.FIELD_CURRENTPASSWORD] = currentPassword;
            newValues[accountForm.FIELD_NEWPASSWORD] = newPassword;
            newValues[accountForm.FIELD_NEWPASSWORDCONFIRM] = newPassword;

            return browser.click(accountPage.PERSONAL_DATA)
                .then(() => browser.waitForExist(accountForm.FIELD_EMAIL))
                .then(() => accountForm.changePassword(newValues))
                .then(() => browser.waitForExist(accountPage.ACCOUNT_PAGE_OPTIONS));
        });

        it('should reset it to the original password', () => {
            let currentPassword = 'qwertyuiop';
            let newPassword = 'Test123!';
            let newValues = {};

            newValues[accountForm.FIELD_CURRENTPASSWORD] = currentPassword;
            newValues[accountForm.FIELD_NEWPASSWORD] = newPassword;
            newValues[accountForm.FIELD_NEWPASSWORDCONFIRM] = newPassword;

            return browser.click(accountPage.PERSONAL_DATA)
                .then(() => browser.waitForExist(accountForm.FIELD_EMAIL))
                .then(() => accountForm.changePassword(newValues))
                .then(() => browser.waitForExist(accountPage.ACCOUNT_PAGE_OPTIONS));
        });

    });
});
