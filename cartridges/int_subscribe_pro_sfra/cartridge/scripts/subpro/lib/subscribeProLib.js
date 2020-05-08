var HttpServices = require('~/cartridge/scripts/subpro/init/httpServiceInit.js');

/**
 * SubscribeProLib
 *
 * This library provides an interface to communicate with the Subscribe Pro REST API
 * Any API endpoints that need to be accessed, by some other logic in the application,
 * should be a added as a method in this object. Methods should be prefixed with the
 * relevant HTTP method (get / post)
 */
var SubscribeProLib = {
    /**
     * Get a Web Service instance for the specified service name
     * @param {string} serviceName Name of the service to get
     * @returns {Object} Service
     */
    getService: function (serviceName) {
        var serviceNameParts = serviceName.split('.');
        Object.keys(serviceNameParts).forEach(function (item) {
            serviceNameParts[item] = serviceNameParts[item].charAt(0).toUpperCase() + serviceNameParts[item].substr(1);
        });
        serviceName = serviceNameParts.join('');
        return HttpServices[serviceName];
    },

    /**
     * Handle API Responses
     * This method can be used to handle any API responses in a similar fashion.
     * If there is not a result.object but an error message is present, we assume
     * this is an error state and return a relevant response object, noting as such
     * @param {Object} result The result of a request
     * @returns {Object} Handled response
     */
    handleResponse: function (result) {
        if (!result.object && result.errorMessage) {
            var jsonObject;

            try {
                jsonObject = JSON.parse(result.errorMessage);
            } catch (e) {
                jsonObject = result.errorMessage;
            }

            return {
                error: true,
                result: jsonObject
            };
        }
        return {
            error: false,
            result: result.object
        };
    },

    /**
     * Request the config object for this applications Subscribe Pro Account
     * API Endpoint: GET /services/v2/config
     *
     * @returns {Object} an object containing if this service returned an error and the results of the API request
     */
    getConfig: function () {
        var service = SubscribeProLib.getService('subpro.http.get.config');
        return SubscribeProLib.handleResponse(service.call());
    },

    /**
     * Request a list of subscriptions for the supplied customer id.
     * If a customer id is not found, an error will be returned.
     *
     * API Endpoint: GET /services/v2/subscriptions
     *
     * @param {string} customerID Customer ID whose subscriptions to get
     * @returns {Object} an object containing whether or not this service returned an error and the results of the API request
     */
    getSubscription: function (customerID) {
        if (!customerID) {
            return {
                error: true,
                result: 'Customer ID is required for the getSubscription method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.get.subscriptions');

        return SubscribeProLib.handleResponse(service.call({ customer_id: customerID }));
    },

    /**
     * Create a new subscription.
     *
     * API Endpoint: POST /services/v2/subscription.{_format}
     *
     * @param {Object} subscription The subscription data
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postSubscription: function (subscription) {
        var service = SubscribeProLib.getService('subpro.http.post.subscription');

        return SubscribeProLib.handleResponse(service.call({ subscription: subscription }));
    },

    /**
     * Create a new address
     *
     * API Endpoint: POST /services/v2/address.{_format}
     *
     * @param {Object} address The address to create
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postCreateAddress: function (address) {
        var service = SubscribeProLib.getService('subpro.http.post.addresses');

        return SubscribeProLib.handleResponse(service.call({ address: address }));
    },

    /**
     * Update an Address
     *
     * API Endpoint: GET /services/v2/addresses/{id}
     *
     * @param {int} addressID The ID of the address to update
     * @param {Object} address The new address data
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postUpdateAddress: function (addressID, address) {
        if (!addressID) {
            return {
                error: true,
                result: 'Address ID is required for the postUpdateAddress method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.post.addresses');

        return SubscribeProLib.handleResponse(service.call({ address_id: addressID, address: address }));
    },

    /**
     * Find a matching address or create a new one
     *
     * API Endpoint: POST /services/v2/address/find-or-create.{_format}
     *
     * @param {Object} address The address to find or create
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    findCreateAddress: function (address) {
        var service = SubscribeProLib.getService('subpro.http.post.addressfindcreate');
        return SubscribeProLib.handleResponse(service.call({ address: address }));
    },

    /**
     * Request a list of addresses for the supplied customer id.
     * If a customer id is not found, an error will be returned.
     *
     * API Endpoint: GET /services/v2/addresses
     *
     * @param {int} customerID The ID of the customer whose addresses should be fetched
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getAddresses: function (customerID) {
        if (!customerID) {
            return {
                error: true,
                result: 'Customer ID is required for the getAddresses method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.get.addresses');

        return SubscribeProLib.handleResponse(service.call({ customer_id: customerID }));
    },

    /**
     * Get a single product by sku
     *
     * API Endpoint: GET /services/v2/products.{_format}
     *
     * @param {string} sku The SKU of the product to get
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getProduct: function (sku) {
        if (!sku) {
            return {
                error: true,
                result: 'sku is required for the getProduct method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.get.products');

        return SubscribeProLib.handleResponse(service.call({ sku: sku }));
    },

    /**
     * Get customer information based on ID
     *
     * API Endpoint: GET /services/v2/customers/{id}.{_format}
     *
     * @param {int} customerID ID of the customer to get
     * @param {string} customerEmail Email address of the customer to get
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getCustomer: function (customerID, customerEmail) {
        if (!customerID && !customerEmail) {
            return {
                error: true,
                result: 'customerID or customerEmail is required for the getCustomer method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.get.customers');
        var params = {};

        if (customerID) {
            params = { customer_id: customerID };
        } else if (customerEmail) {
            params = { email: customerEmail };
        }

        return SubscribeProLib.handleResponse(service.call(params));
    },

    /**
     * Create a new customer at Subscribe Pro
     *
     * API Endpoint: POST /services/v2/customer.{_format}
     *
     * @param {Object} customer The customer data to create
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    createCustomer: function (customer) {
        var service = SubscribeProLib.getService('subpro.http.post.customer');

        return SubscribeProLib.handleResponse(service.call({ customer: customer }));
    },

    /**
     * Update a customer
     *
     * API Endpoint: POST /services/v2/customers/{id}.{_format}
     *
     * @param {int} customerID The ID of the customer to update
     * @param {Object} customer The new customer data
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    updateCustomer: function (customerID, customer) {
        if (!customerID) {
            return {
                error: true,
                result: 'customerID is required for the updateCustomer method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.post.customers');

        return SubscribeProLib.handleResponse(service.call({ customer_id: customerID, customer: customer }));
    },

    /**
     * Get access token
     *
     * API Endpoint: GET|POST /oauth/v2/token
     *
     * @param {int} customerID The ID of the customer for whom a token should be requested
     * @param {string} grantType The request Grant Type
     * @param {string} scope The request Scope
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getToken: function (customerID, grantType, scope) {
        if (!customerID || !grantType || !scope) {
            return {
                error: true,
                result: 'customerID or grantType or scope parameter is missing'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.get.token');

        return SubscribeProLib.handleResponse(service.call({
            customer_id: customerID,
            grant_type: grantType,
            scope: scope
        }));
    },

    /**
     * Retrieve a single payment profile by id
     *
     * API Endpoint: GET /services/v1/vault/paymentprofiles/{id}.{_format}
     *
     * @param {int} paymentProfileID The ID of the payment profile to get
     * @param {int} transactionID The ID of the transaction to use to get a payment profile
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getPaymentProfile: function (paymentProfileID, transactionID) {
        if (!paymentProfileID && !transactionID) {
            return {
                error: true,
                result: 'paymentprofileID or transactionID is required for the getPaymentProfile method'
            };
        }

        var service = SubscribeProLib.getService('subpro.http.get.paymentprofile');
        var params = {};

        if (paymentProfileID) {
            params = { paymentprofile_id: paymentProfileID };
        } else if (transactionID) {
            params = { transaction_id: transactionID };
        }

        return SubscribeProLib.handleResponse(service.call(params));
    },

    /**
     * Create a new payment profile for an external vault
     *
     * API Endpoint: POST /services/v2/vault/paymentprofile/external-vault.{_format}
     *
     * @param {Object} paymentProfile The data to use to create a payment profile
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    createPaymentProfile: function (paymentProfile) {
        var service = SubscribeProLib.getService('subpro.http.post.paymentprofile.vault');

        return SubscribeProLib.handleResponse(service.call({ paymentProfile: paymentProfile }));
    },

    /**
     * Check if customer is registered. This is necessary to proceed to checkout with SubPro subscription
     *
     * @returns {boolean} True customer is registered; otherwise, files
     */
    isCheckoutPermitted: function () {
        /* global customer */
        return customer.authenticated && customer.registered;
    },

    /**
     * Check if has cart credit card payment method, required for processing orders with SubPro subscription.
     *
     * @param {module:models/CartModel~CartModel} cart - A CartModel wrapping the current Basket.
     *
     * @returns {boolean} True if cart has at least one credit card payment method; otherwise, false
     */
    hasCreditCard: function (cart) {
        if (!cart) {
            return false;
        }

        var instruments = cart.object.paymentInstruments;
        var hasCreditCard = false;

        for (var i = 0, count = instruments.length; i < count; i += 1) {
            if (instruments[i].paymentMethod === 'CREDIT_CARD') {
                hasCreditCard = true;
                break;
            }
        }

        return hasCreditCard;
    },

    /**
     * Check if cart has Product Line Items with SubPro subscription
     *
     * @returns {boolean} True if cart has items SubPro subscription; otherwise, false
     */
    isSubPro: function () {
        var BasketMgr = require('dw/order/BasketMgr');
        var basket = BasketMgr.getCurrentOrNewBasket();
        var plis = basket.getAllProductLineItems();
        var isSubpro = false;

        if (!plis) {
            return false;
        }

        for (var i = 0, il = plis.length; i < il; i += 1) {
            try {
                isSubpro = plis[i].custom.subproSubscriptionSelectedOptionMode === 'regular';
                if (isSubpro) break;
            } catch (e) {
                break;
            }
        }

        return !!isSubpro;
    }
};

module.exports = SubscribeProLib;
