'use strict';

/* API includes */
var SubscribeProLib = require('*/cartridge/scripts/subpro/lib/subscribeProLib');

/**
 * Provides an interface for configuring Subscribe Pro widgets.
 */
var WidgetsHelper = {

    /**
     * Get access token for widgets and store it to session
     *
     * @param {string} customerID The client application's identifier
     * @param {string} grantType Grant type: refresh_token|authorization_code|password|client_credentials|custom
     * @param {string} scope Scope for the access token grant. 'client' or 'widget' or custom scope
     */
    getAccessToken: function (customerID, grantType, scope) {
        var response = SubscribeProLib.getToken(customerID, grantType, scope);

        if (response.error) {
            return;
        }

        // Set cookie expiration time.
        // We get 'expires_in' in seconds then convert it to milliseconds.
        // Set the expiration to 5 minutes earlier than what it actually is, just to be safe. Use timeGap variable for that purpose.
        var timeGap = 5 * 60 * 1000;
        var expirationTime = new Date().setTime(Date.now() + response.result.expires_in * 1000 - timeGap);
        /* global session */
        session.privacy.widgetAccessToken = response.result.access_token;
        session.privacy.widgetEnvironmentKey = response.result.spreedly_environment_key;
        session.privacy.widgetCustomerId = response.result.customer_id;
        session.privacy.widgetExpiresOn = expirationTime;
    },

    /**
     * Configure widget properties
     *
     * @param {string} customerID The client application's identifier
     * @param {string} grantType Grant type: refresh_token|authorization_code|password|client_credentials|custom
     * @param {string} scope Scope for the access token grant. 'client' or 'widget' or custom scope
     * @param {string} widgetID html id attribute of element which the widget will be rendered to
     * @param {string} [widgetParent] html class attribute of an element which will contain widget
     *
     * @return {Object} widget properties
     */
    getWidgetConfig: function (customerID, grantType, scope, widgetID, widgetParent) {
        if (!session.privacy.widgetExpiresOn || Date.now() >= session.privacy.widgetExpiresOn) {
            this.getAccessToken(customerID, grantType, scope);
        }

        //
        // My Subscriptions Widget Configuration
        //
        var originalWidgetConfig = {
            element: widgetID,
            apiBaseUrl: require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproApiBaseUrl'),
            apiAccessToken: session.privacy.widgetAccessToken,
            environmentKey: session.privacy.widgetEnvironmentKey,
            customerId: session.privacy.widgetCustomerId
        };

        var customWidgetConfig = JSON.parse(require('dw/system/Site').getCurrent().getCustomPreferenceValue('subproSubscriptionsWidgetConfig'));

        var widgetConfig = {};
        var key = null;
        for (key in customWidgetConfig) {
            widgetConfig[key] = customWidgetConfig[key];
        }

        var origKey = null;
        for (origKey in originalWidgetConfig) {
            widgetConfig[origKey] = originalWidgetConfig[origKey];
        }

        if (widgetParent) {
            widgetConfig.addToOrderElementClass = widgetParent;
        }

        return widgetConfig;
    }
};

module.exports = WidgetsHelper;
