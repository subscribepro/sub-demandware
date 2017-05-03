'use strict';

/* API includes */
const SubscribeProLib = require('~/cartridge/scripts/subpro/lib/SubscribeProLib');

/**
 * Provides an interface for configuring Subscribe Pro widgets.
 */
let WidgetsHelper = {

    /**
     * Get access token for widgets and store it to session
     *
     * @param {String} customerID The client application's identifier
     * @param {String} grantType Grant type: refresh_token|authorization_code|password|client_credentials|custom
     * @param {String} scope Scope for the access token grant. 'client' or 'widget' or custom scope
     */
    getAccessToken: function (customerID, grantType, scope) {
        let response = SubscribeProLib.getToken(customerID, grantType, scope);

        if (response.error) {
            return;
        }

        // Set cookie expiration time.
        // We get 'expires_in' in seconds then convert it to milliseconds.
        // Set the expiration to 5 minutes earlier than what it actually is, just to be safe. Use timeGap variable for that purpose.
        let timeGap = 5 * 60 * 1000;
        let expirationTime = new Date().setTime(Date.now() + response.result.expires_in * 1000 - timeGap);

        session.custom.widgetAccessToken = response.result.access_token;
        session.custom.widgetEnvironmentKey = response.result.spreedly_environment_key;
        session.custom.widgetCustomerId = response.result.customer_id;
        session.custom.widgetExpiresOn = expirationTime;
    },

    /**
     * Configure widget properties
     *
     * @param {String} customerID The client application's identifier
     * @param {String} grantType Grant type: refresh_token|authorization_code|password|client_credentials|custom
     * @param {String} scope Scope for the access token grant. 'client' or 'widget' or custom scope
     * @param {String} widgetID html id attribute of element which the widget will be rendered to
     * @param {String} [widgetParent] html class attribute of an element which will contain widget
     *
     * @return {Object} widget properties
     */
    getWidgetConfig: function (customerID, grantType, scope, widgetID, widgetParent) {
        if (!session.custom.widgetExpiresOn || Date.now() >= session.custom.widgetExpiresOn) {
            this.getAccessToken(customerID, grantType, scope);
        }

        let widgetConfig = {
            widgetElementId: widgetID,
            apiBaseUrl: 'https://' + require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproApiBaseUrl'),
            apiAccessToken: session.custom.widgetAccessToken,
            environmentKey: session.custom.widgetEnvironmentKey,
            customerId: session.custom.widgetCustomerId
        };

        if (widgetParent) {
            widgetConfig['addToOrderElementClass'] = widgetParent;
        }

        return widgetConfig;
    }
};

module.exports = WidgetsHelper;