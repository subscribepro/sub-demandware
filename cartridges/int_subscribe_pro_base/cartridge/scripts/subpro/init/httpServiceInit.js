/**
 * Initialize HTTP services for the Subscribe Pro API
 */
importPackage(dw.svc);
importPackage(dw.net);
importPackage(dw.io);

let Encoding = require("dw/crypto/Encoding");

/**
 * Mock Data
 */
let AccessTokenMockData = require("../mock_data/AccessTokenMockData");
let ConfigMockData = require("../mock_data/ConfigMockData");
let SubscriptionMockData = require("../mock_data/SubscriptionMockData");
let SubscriptionsMockData = require("../mock_data/SubscriptionsMockData");
let AddressMockData = require("../mock_data/AddressMockData");
let AddressesMockData = require("../mock_data/AddressesMockData");
let ProductMockData = require("../mock_data/ProductMockData");
let CustomerMockData = require("../mock_data/CustomerMockData");
let PaymentProfileMockData = require("../mock_data/PaymentProfileMockData");
let SubscribeProLib = require("*/cartridge/scripts/subpro/lib/SubscribeProLib");

/**
 * Wrap the Mock JSON data with request information so
 * the mocked response looks how a normal response will look
 *
 * @param data : JSONObject
 */
function getMockJSON(data) {
    return {
        statusCode: 200,
        statusMessage: "Success",
        text: JSON.stringify(data)
    };
}

/**
 * Service: subpro.http.get.config
 * Get the configuration options for the merchant's Subscribe Pro Account
 */
ServiceRegistry.configure("subpro.http.get.config", {
    /**
     * Create the service request
     * - Set request method to be the HTTP GET method
     * - Append the customer as a URL parameter
     */
    createRequest: function (svc: HTTPService, args) {
        svc.setRequestMethod("GET");
        SubscribeProLib.setURL(svc, "config.json", "");
        return null;
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Config Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return {
            statusCode: 200,
            statusMessage: "Success",
            text: JSON.stringify(ConfigMockData)
        };
    }
});

/**
 * Service: subpro.http.get.subscriptions
 * Get any product subscriptions for the supplied customer using their ID
 */
ServiceRegistry.configure("subpro.http.get.subscriptions", {
    /**
     * Create the service request
     * - Set request method to be the HTTP GET method
     * - Append the customer as a URL parameter
     */
    createRequest: function (svc: HTTPService, args) {
        svc.setRequestMethod("GET");
        SubscribeProLib.setURL(svc, "subscriptions.json", "customer_id=" + Encoding.toURI(args.customer_id));
        return null;
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Subscriptions Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return {
            statusCode: 200,
            statusMessage: "Success",
            text: JSON.stringify(SubscriptionsMockData)
        };
    }
});

/**
 * Service: subpro.http.post.subscription
 * Create a new subscription for a customer
 */
ServiceRegistry.configure("subpro.http.post.subscription", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPService, args) {
        svc.setRequestMethod("POST");
        SubscribeProLib.setURL(svc, "subscription.json", "");

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({subscription: args.subscription});
        } else {
            return null;
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Subscriptions Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(SubscriptionMockData);
    }
});

/**
 * Service: subpro.http.post.addresses
 * Create or update a customer's address
 */
ServiceRegistry.configure("subpro.http.post.addresses", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        /**
         * Since the service type is HTTP Form, this is unnecessary but was added anyway to show the functionality
         */
        svc.setRequestMethod("POST");

        /**
         * Setup the URL
         */
        if (args.address_id) {
            SubscribeProLib.setURL(svc, "addresses/" + Encoding.toURI(args.address_id), "");
        } else {
            SubscribeProLib.setURL(svc, "address", "");
        }

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({address: args.address});
        } else {
            return null;
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(AddressMockData);
    }
});

/**
 * Service: subpro.http.post.addressfindcreate
 * Find and update or create a new customer address
 */
ServiceRegistry.configure("subpro.http.post.addressfindcreate", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("POST");
        SubscribeProLib.setURL(svc, "address/find-or-create.json", "");

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({address: args.address});
        } else {
            return null;
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(AddressMockData);
    }
});

/**
 * Service: subpro.http.get.addresses
 * Retrieve the addresses for the supplied customer
 */
ServiceRegistry.configure("subpro.http.get.addresses", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("GET");
        SubscribeProLib.setURL(svc, "addresses.json", "customer_id=" + Encoding.toURI(args.customer_id));
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(AddressesMockData);
    }
});

/**
 * Service: subpro.http.get.products
 * Retrieve the Subscribe Pro product using the supplied sku
 */
ServiceRegistry.configure("subpro.http.get.products", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("GET");
        SubscribeProLib.setURL(svc, "products.json", "sku=" + Encoding.toURI(args.sku));
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(ProductMockData);
    }
});

/**
 * Service: subpro.http.get.customers
 * Retrieve a Subscribe Pro customer via their Subscribe Pro ID
 */
ServiceRegistry.configure("subpro.http.get.customers", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("GET");

        if (args.customer_id) {
            SubscribeProLib.setURL(svc, "customers/" + Encoding.toURI(args.customer_id) + ".json", "");
        } else if (args.email) {
            SubscribeProLib.setURL(svc, "customers.json", "email=" + Encoding.toURI(args.email));
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(CustomerMockData);
    }
});

/**
 * Service: subpro.http.post.customer
 * Create a Subscribe Pro Customer
 */
ServiceRegistry.configure("subpro.http.post.customer", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("POST");
        SubscribeProLib.setURL(svc, "customer.json", "");

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({customer: args.customer});
        } else {
            return null;
        }
    },
    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(CustomerMockData);
    }
});

/**
 * Service: subpro.http.post.customers
 * Update a Subscribe Pro customer using the supplied customer ID
 */
ServiceRegistry.configure("subpro.http.post.customers", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("POST");
        SubscribeProLib.setURL(svc, "customers/" + Encoding.toURI(args.customer_id) + ".json", "");

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({customer: args.customer});
        } else {
            return null;
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(CustomerMockData);
    }
});

/**
 * Service: subpro.http.get.token
 * Retrieve a Subscribe Pro OAUTH Token for the Supplied Customer ID
 */
ServiceRegistry.configure("subpro.http.get.token", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("GET");
        SubscribeProLib.setURL(svc, "token",  "grant_type=" + args.grant_type +
            "&scope=" + args.scope + "&customer_id=" + Encoding.toURI(args.customer_id), 'subpro.http.cred.oauth.');
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
    	var logger = require('dw/system/Logger').getLogger('root');
    	logger.info('client.text');
    	logger.info(client.text);
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(AccessTokenMockData);
    }
});

/**
 * Service: subpro.http.get.paymentprofile
 * Retrieve a payment profile with the supplied payment profile ID
 */
ServiceRegistry.configure("subpro.http.get.paymentprofile", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("GET");
        if (args.paymentprofile_id) {
            SubscribeProLib.setURL(svc, "vault/paymentprofiles/" + Encoding.toURI(args.paymentprofile_id) + ".json", "");
        } else if (args.transaction_id) {
            SubscribeProLib.setURL(svc, "vault/paymentprofiles.json", "transaction_id=" + Encoding.toURI(args.transaction_id));
        } else {
            throw new Error("subpro.http.get.paymentprofile requires a paymentprofile_id or transaction_id");
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(PaymentProfileMockData);
    }
});

/**
 * Service: subpro.http.post.paymentprofile.vault
 * Create a new payment profile at Subscribe Pro
 */
ServiceRegistry.configure("subpro.http.post.paymentprofile.vault", {
    /**
     * Create the service request
     */
    createRequest: function (svc: HTTPFormService, args) {
        svc.setRequestMethod("POST");
        SubscribeProLib.setURL(svc, "vault/paymentprofile/external-vault.json", "");

        /**
         * Return the parameters to be POSTed to the URL, if there are any
         */
        if (args) {
            return JSON.stringify({payment_profile: args.paymentProfile});
        } else {
            return null;
        }
    },

    /**
     * JSON parse the response text and return it
     */
    parseResponse: function (svc: HTTPService, client: HTTPClient) {
        return JSON.parse(client.text);
    },

    /**
     * Return the Mocked Address Data
     */
    mockCall: function (svc: HTTPService, client: HTTPClient) {
        return getMockJSON(PaymentProfileMockData);
    }
});