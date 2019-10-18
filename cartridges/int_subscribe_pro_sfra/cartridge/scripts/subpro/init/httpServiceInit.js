/**
 * Initialize HTTP services for the Subscribe Pro API
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Encoding = require('dw/crypto/Encoding');
/* eslint no-unused-vars: "off" */

/**
 * Update the URL Parameter of the Service to include the
 * specified endpoint and any supplied parameters
 *
 * @param {HTTPService} svc HTTP Service to update URL on
 * @param {string} endpoint API Endpoint to call on the service
 * @param {string} parameters GET URL parameters to append to the URL
 * @param {string} credPrefix Prefix for credential ID
 */
function setURL(svc, endpoint, parameters, credPrefix) {
    /**
     * Current Site, used to reference site preferences
     */
    var CurrentSite = require('dw/system/Site').getCurrent();

    svc.setCredentialID((credPrefix || 'subpro.http.cred.') + CurrentSite.getCustomPreferenceValue('subproAPICredSuffix'));

    /**
     * Replace the URL parameters with the relevant values
     */
    var url = svc.getURL();
    url = url.replace('{ENDPOINT}', endpoint);
    url = url.replace('{PARAMS}', parameters);

    /**
     * Save the newly constructed url
     */
    svc.setURL(url);
}

/**
 * Service: subpro.http.get.config
 * Get the configuration options for the merchant's Subscribe Pro Account
 */
module.exports.SubproHttpGetConfig = LocalServiceRegistry.createService('subpro.http.get.config', {
    /**
     * Create the service request
     * - Set request method to be the HTTP GET method
     * - Append the customer as a URL parameter
     * @param {HTTPService} svc Service object
     * @param {array} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');
        setURL(svc, 'config.json', '');
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

/**
 * Service: subpro.http.get.subscriptions
 * Get any product subscriptions for the supplied customer using their ID
 */
module.exports.SubproHttpGetSubscriptions = LocalServiceRegistry.createService('subpro.http.get.subscriptions', {
    /**
     * Create the service request
     * - Set request method to be the HTTP GET method
     * - Append the customer as a URL parameter
     * @param {HTTPService} svc Service Object
     * @param {Object} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');
        setURL(svc, 'subscriptions.json', 'customer_id=' + Encoding.toURI(args.customer_id));
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

/**
 * Service: subpro.http.post.subscription
 * Create a new subscription for a customer
 */
module.exports.SubproHttpPostSubscription = LocalServiceRegistry.createService('subpro.http.post.subscription', {
    /**
     * Create the service request
     * @param {HTTPService} svc Service Object
     * @param {Object} args Arguments
     * @return {string|null} JSON string of parameters POSTed.
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('POST');
        setURL(svc, 'subscription.json', '');

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({ subscription: args.subscription });
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

/**
 * Service: subpro.http.post.addresses
 * Create or update a customer's address
 */
module.exports.SubproHttpPostAddresses = LocalServiceRegistry.createService('subpro.http.post.addresses', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     * @return {string|null} JSON string of parameters POSTed.
     */
    createRequest: function (svc, args) {
        /**
         * Since the service type is HTTP Form, this is unnecessary but was added anyway to show the functionality
         */
        svc.setRequestMethod('POST');

        /**
         * Setup the URL
         */
        if (args.address_id) {
            setURL(svc, 'addresses/' + Encoding.toURI(args.address_id), '');
        } else {
            setURL(svc, 'address', '');
        }

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({ address: args.address });
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

/**
 * Service: subpro.http.post.addressfindcreate
 * Find and update or create a new customer address
 */
module.exports.SubproHttpPostAddressfindcreate = LocalServiceRegistry.createService('subpro.http.post.addressfindcreate', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     * @return {string|null} JSON string of parameters POSTed.
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('POST');
        setURL(svc, 'address/find-or-create.json', '');

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({ address: args.address });
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

/**
 * Service: subpro.http.get.addresses
 * Retrieve the addresses for the supplied customer
 */
module.exports.SubproHttpGetAddresses = LocalServiceRegistry.createService('subpro.http.get.addresses', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');
        setURL(svc, 'addresses.json', 'customer_id=' + Encoding.toURI(args.customer_id));
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

/**
 * Service: subpro.http.get.products
 * Retrieve the Subscribe Pro product using the supplied sku
 */
module.exports.SubproHttpGetProducts = LocalServiceRegistry.createService('subpro.http.get.products', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');
        setURL(svc, 'products.json', 'sku=' + Encoding.toURI(args.sku));
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

/**
 * Service: subpro.http.get.customers
 * Retrieve a Subscribe Pro customer via their Subscribe Pro ID
 */
module.exports.SubproHttpGetCustomers = LocalServiceRegistry.createService('subpro.http.get.customers', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');

        if (args.customer_id) {
            setURL(svc, 'customers/' + Encoding.toURI(args.customer_id) + '.json', '');
        } else if (args.email) {
            setURL(svc, 'customers.json', 'email=' + Encoding.toURI(args.email));
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

/**
 * Service: subpro.http.post.customer
 * Create a Subscribe Pro Customer
 */
module.exports.SubproHttpPostCustomer = LocalServiceRegistry.createService('subpro.http.post.customer', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     * @return {string|null} JSON string of parameters POSTed.
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('POST');
        setURL(svc, 'customer.json', '');

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({ customer: args.customer });
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

/**
 * Service: subpro.http.post.customers
 * Update a Subscribe Pro customer using the supplied customer ID
 */
module.exports.SubproHttpPostCustomers = LocalServiceRegistry.createService('subpro.http.post.customers', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     * @return {string|null} JSON string of parameters POSTed.
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('POST');
        setURL(svc, 'customers/' + Encoding.toURI(args.customer_id) + '.json', '');

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({ customer: args.customer });
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

/**
 * Service: subpro.http.get.token
 * Retrieve a Subscribe Pro OAUTH Token for the Supplied Customer ID
 */
module.exports.SubproHttpGetToken = LocalServiceRegistry.createService('subpro.http.get.token', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');
        setURL(svc, 'token', 'grant_type=' + args.grant_type
            + '&scope=' + args.scope + '&customer_id=' + Encoding.toURI(args.customer_id), 'subpro.http.cred.oauth.');
    },

    /**
     * JSON parse the response text and return it
     * @param {HTTPService} svc Service Object
     * @param {HTTPClient} client Client object
     * @return {Object} Response object
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

/**
 * Service: subpro.http.get.paymentprofile
 * Retrieve a payment profile with the supplied payment profile ID
 */
module.exports.SubproHttpGetPaymentprofile = LocalServiceRegistry.createService('subpro.http.get.paymentprofile', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('GET');
        if (args.paymentprofile_id) {
            setURL(svc, 'vault/paymentprofiles/' + Encoding.toURI(args.paymentprofile_id) + '.json', '');
        } else if (args.transaction_id) {
            setURL(svc, 'vault/paymentprofiles.json', 'transaction_id=' + Encoding.toURI(args.transaction_id));
        } else {
            throw new Error('subpro.http.get.paymentprofile requires a paymentprofile_id or transaction_id');
        }
    },

    /**
     * JSON parse the response text and return it
     * @param {HTTPService} svc Service Object
     * @param {HTTPClient} client Client object
     * @return {Object} Response object
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

/**
 * Service: subpro.http.post.paymentprofile.vault
 * Create a new payment profile at Subscribe Pro
 */
module.exports.SubproHttpPostPaymentprofileVault = LocalServiceRegistry.createService('subpro.http.post.paymentprofile.vault', {
    /**
     * Create the service request
     * @param {HTTPFormService} svc Form service
     * @param {Object} args Arguments
     * @return {string|null} JSON string of parameters POSTed.
     */
    createRequest: function (svc, args) {
        svc.setRequestMethod('POST');
        setURL(svc, 'vault/paymentprofile/external-vault.json', '');

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({ payment_profile: args.paymentProfile });
        }
    },

    /**
     * JSON parse the response text and return it
     * @param {HTTPService} svc Service Object
     * @param {HTTPClient} client Client object
     * @return {Object} Response object
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
