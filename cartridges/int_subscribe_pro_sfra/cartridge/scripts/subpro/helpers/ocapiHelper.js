'use strict';

/* eslint-disable no-param-reassign */

/**
 * Check object in property existing
 * @param {Object} response - Object with response params
 * @param {string} propertyName - Property name which is needed to check for a existing
 * @returns {boolean} returns true if property exist
 */
function propertyExist(response, propertyName) {
    return Object.hasOwnProperty.call(response, propertyName);
}

/**
 * Set property value if it exist
 * @param {Object} response - Object with response params
 * @param {string} propertyName - Property name which is needed to define
 * @returns {string} returns property value if it's defined. Otherwise returns null
 */
function setProperty(response, propertyName) {
    return propertyExist(response, propertyName) ? response[propertyName] : null;
}

/**
 * Perform a Error response decorate
 * @param {Object} response - Object with error response params
 * @returns {Object} returns parsed error response for payment requests
 */
function errorResponse(response) {
    let status = setProperty(response, 'status') || 'APPLICATION_EXCEPTION';
    let errors = [];

    // Base error body
    let errObj = {
        error: {
            message: setProperty(response, 'message'),
            details: setProperty(response, 'details')
        }
    };

    errors.push(errObj);

    return {
        status: status,
        errors: errors
    };
}

/**
 * fillOrderOcapiError
 * @param {dw.order.Order} order - api object of Order
 * @param {Object} errorObj - error object
 */
function fillOrderOcapiError(order, errorObj) {
    order.custom.ocapiError = JSON.stringify(errorObj);
}

module.exports = {
    errorResponse: errorResponse,
    fillOrderOcapiError: fillOrderOcapiError
};
