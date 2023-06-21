/**
 * Initialize HTTP services for the Subscribe Pro API
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var ServicesConfig = require('~/cartridge/scripts/subpro/init/ServicesConfig.js');
/* eslint no-unused-vars: "off" */

function createAndSetURL(svc, args) {
    var { actionId, dynamicAction, parameters, credPrefix } = args;

    /**
     * Current Site, used to reference site preferences
     */

    var CurrentSite = require('dw/system/Site').getCurrent();

    if (typeof credPrefix !== 'undefined') {
        svc.setCredentialID(credPrefix + CurrentSite.getCustomPreferenceValue('subproAPICredSuffix'));
    } else {
        svc.setCredentialID('subpro.http.creds.' + CurrentSite.getCustomPreferenceValue('subproAPICredSuffix'));
    }

    var action = ServicesConfig.getValueByPath(actionId);

    if (!empty(dynamicAction)) {
        var keyDynamicAction = Object.keys(dynamicAction)[0];
        action = action.replace('{' + keyDynamicAction + '}', dynamicAction[keyDynamicAction]);
    }

    if (typeof parameters !== 'undefined') {
        action = action + '?' + parameters;
    }

    /**
     * Replace the URL parameters with the relevant values
     */
    var url = svc.getURL() + action;

    /**
     * Save the newly constructed url
     */
    svc.setURL(url);
}

/**
 * Service: subpro.http.universal
 * Retrieve the data from server's Subscribe Pro
 * var config = {
 *                  accessToken: session.privacy.subProAccessToken,
 *                  actionId: 'services.v2.product{id}',
 *                  dynamicAction: { ID: '555' },
 *                  method: 'POST',
 *                  parameters: 'QueryString',
 *                  payload: 'Object'
 *              };
 *
 */
module.exports.SubproHttpService = function () {
    var service = LocalServiceRegistry.createService('subpro.http.universal', {
        /**
         * Create the service request
         * @param {HTTPFormService} svc Form service
         * @param {Object} args Arguments
         */
        createRequest: function (svc, args) {
            svc.setRequestMethod(args.method);
            svc.setAuthentication('BASIC');

            if (args.actionId !== 'oauth.v2.token') {
                svc.addHeader('Authorization', 'Bearer ' + args.accessToken);
            }
            if (args.actionId === 'oauth.v2.token') {
                svc.setAuthentication('BASIC');
            }

            createAndSetURL(svc, args);
            if (args.payload) {
                return JSON.stringify(args.payload);
            }
        },

        /**
         * JSON parse the response text and return it
         * @param {HTTPService} svc Service Object
         * @param {HTTPClient} client Client object
         * @return {Object} response object
         */
        parseResponse: function (svc, client) {
            return JSON.parse(client.text);
        },

        /**
         * Filter Log messages for this request
         * @param {string} msg Original message
         * @return {string} Filtered message
         */
        filterLogMessage: function (msg) {
            return msg;
        }
    });
    return service;
};
