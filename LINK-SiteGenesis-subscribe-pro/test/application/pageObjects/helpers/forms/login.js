import * as testData from '../../testData/main';

export const BTN_LOGIN = 'button[name*="_login_login"]';
export const INPUT_EMAIL = '.username input';
export const INPUT_PASSWORD = '.password input';

/**
 * Fill in login form
 */
export function loginAs (login, password) {
    // After several trials, 30000 yields the fewest number of test failures
    // involving this waitForVisible
    var _password = password;
    // if no password is provided, use the default one
    if (!_password) {
        _password = testData.defaultPassword;
    }
    return browser.waitForVisible(INPUT_EMAIL, 30000)
        .setValue(INPUT_EMAIL, login)
        .setValue(INPUT_PASSWORD, _password)
        .click(BTN_LOGIN);
}
