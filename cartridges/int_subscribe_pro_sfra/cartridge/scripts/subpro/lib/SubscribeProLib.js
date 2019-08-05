importPackage(dw.svc);

/**
 * SubscribeProLib
 *
 * This library provides an interface to communicate with the Subscribe Pro REST API
 * Any API endpoints that need to be accessed, by some other logic in the application,
 * should be a added as a method in this object. Methods should be prefixed with the
 * relevant HTTP method (get / post)
 */
let SubscribeProLib = {
    /**
     * Get a Web Service instance for the specified service name
     */
    getService: function(serviceName) {
        return ServiceRegistry.get(serviceName);
    },

    /**
     * Handle API Responses
     * This method can be used to handle any API responses in a similar fashion.
     * If there is not a result.object but an error message is present, we assume
     * this is an error state and return a relevant response object, noting as such
     */
    handleResponse: function(result) {
        let returnObject, hasError;

        if (!result.object && result.errorMessage) {
            let jsonObject;

            try {
                jsonObject = JSON.parse(result.errorMessage);
            } catch (e) {
                jsonObject = result.errorMessage;
            }

            return {
                error: true,
                result: jsonObject
            };
        } else {
            return {
                error: false,
                result: result.object
            };
        }

        return {};
    },

    /**
     * Request the config object for this applications Subscribe Pro Account
     * API Endpoint: GET /services/v2/config
     *
     * @return Object an object containing if this service returned an error and the results of the API request
     */
    getConfig: function() {
        let service = SubscribeProLib.getService("subpro.http.get.config");
        return SubscribeProLib.handleResponse(service.call())
    },

    /**
     * Request a list of subscriptions for the supplied customer id.
     * If a customer id is not found, an error will be returned.
     *
     * API Endpoint: GET /services/v2/subscriptions
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    getSubscription: function(customerID) {
        if (!customerID) {
            return {
                error: true,
                result: "Customer ID is required for the getSubscription method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.get.subscriptions");

        return SubscribeProLib.handleResponse(service.call({customer_id: customerID}));
    },

    /**
     * Create a new subscription.
     *
     * API Endpoint: POST /services/v2/subscription.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    postSubscription: function(subscription) {
        let service = SubscribeProLib.getService("subpro.http.post.subscription");

        return SubscribeProLib.handleResponse(service.call({subscription: subscription}));
    },

    /**
     * Create a new address
     *
     * API Endpoint: POST /services/v2/address.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    postCreateAddress: function(address) {
        let service = SubscribeProLib.getService("subpro.http.post.addresses");

        return SubscribeProLib.handleResponse(service.call({address: address}));
    },

    /**
     * Update an Address
     *
     * API Endpoint: GET /services/v2/addresses/{id}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    postUpdateAddress: function(addressID, address) {
        if (!addressID) {
            return {
                error: true,
                result: "Address ID is required for the postUpdateAddress method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.post.addresses");

        return SubscribeProLib.handleResponse(service.call({address_id: addressID, address: address}));
    },

    /**
     * Find a matching address or create a new one
     *
     * API Endpoint: POST /services/v2/address/find-or-create.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    findCreateAddress: function(address) {
        let service = SubscribeProLib.getService("subpro.http.post.addressfindcreate");
        return SubscribeProLib.handleResponse(service.call({address: address}));
    },

    /**
     * Request a list of addresses for the supplied customer id.
     * If a customer id is not found, an error will be returned.
     *
     * API Endpoint: GET /services/v2/addresses
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    getAddresses: function(customerID) {
        if (!customerID) {
            return {
                error: true,
                result: "Customer ID is required for the getAddresses method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.get.addresses");

        return SubscribeProLib.handleResponse(service.call({customer_id: customerID}));
    },

    /**
     * Get a single product by sku
     *
     * API Endpoint: GET /services/v2/products.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    getProduct: function(sku) {
        if (!sku) {
            return {
                error: true,
                result: "sku is required for the getProduct method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.get.products");

        return SubscribeProLib.handleResponse(service.call({sku: sku}));
    },

    /**
     * Get customer information based on ID
     *
     * API Endpoint: GET /services/v2/customers/{id}.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    getCustomer: function(customerID, customerEmail) {
        if (!customerID && !customerEmail) {
            return {
                error: true,
                result: "customerID or customerEmail is required for the getCustomer method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.get.customers");
        let params = {};

        if (customerID){
            params = {customer_id: customerID};
        } else if (customerEmail) {
            params = {email: customerEmail};
        }

        return SubscribeProLib.handleResponse(service.call(params));
    },

    /**
     * Create a new customer at Subscribe Pro
     *
     * API Endpoint: POST /services/v2/customer.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    createCustomer: function(customer) {
        let service = SubscribeProLib.getService("subpro.http.post.customer");

        return SubscribeProLib.handleResponse(service.call({customer: customer}));
    },

    /**
     * Update a customer
     *
     * API Endpoint: POST /services/v2/customers/{id}.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    updateCustomer: function(customerID, customer) {
        if (!customerID) {
            return {
                error: true,
                result: "customerID is required for the updateCustomer method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.post.customers");

        return SubscribeProLib.handleResponse(service.call({customer_id: customerID, customer: customer}));
    },

    /**
     * Get access token
     *
     * API Endpoint: GET|POST /oauth/v2/token
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    getToken: function(customerID, grantType, scope) {
        if (!customerID || !grantType || !scope) {
            return {
                error: true,
                result: "customerID or grantType or scope parameter is missing"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.get.token");

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
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    getPaymentProfile: function(paymentProfileID, transactionID) {
        if (!paymentProfileID && !transactionID) {
            return {
                error: true,
                result: "paymentprofileID or transactionID is required for the getPaymentProfile method"
            }
        }

        let service = SubscribeProLib.getService("subpro.http.get.paymentprofile");
        let params = {};

        if (paymentProfileID) {
            params = {paymentprofile_id: paymentProfileID};
        } else if (transactionID) {
            params = {transaction_id: transactionID};
        }

        return SubscribeProLib.handleResponse(service.call(params));
    },

    /**
     * Create a new payment profile for an external vault
     *
     * API Endpoint: POST /services/v2/vault/paymentprofile/external-vault.{_format}
     *
     * @return Object an object containing whether or not this service returned an error and the results of the API request
     */
    createPaymentProfile: function(paymentProfile) {
        let service = SubscribeProLib.getService("subpro.http.post.paymentprofile.vault");
        var requestData = service.getRequestData();

        var returnObj = SubscribeProLib.handleResponse(service.call({paymentProfile: paymentProfile}));

        return returnObj;
    },

    /**
     * Check if customer is registered. This is necessary to proceed to checkout with SubPro subscription
     *
     * @return boolean if customer is registered
     */
    isCheckoutPermitted: function() {
        return customer.authenticated && customer.registered;
    },

    /**
     * Check if has cart credit card payment method, required for processing orders with SubPro subscription.
     *
     * @param {module:models/CartModel~CartModel} cart - A CartModel wrapping the current Basket.
     *
     * @return boolean if cart has at least one credit card payment method
     */
    hasCreditCard: function(cart) {
        if (!cart) {
            return false;
        }

        let instruments = cart.object.paymentInstruments,
            hasCreditCard = false;

        for (let i = 0, count = instruments.length; i < count; i++) {
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
     * @return boolean if cart has items SubPro subscription
     */
    isSubPro: function() {
        let BasketMgr = require('dw/order/BasketMgr'),
            basket = BasketMgr.getCurrentOrNewBasket(),
            plis = basket.getAllProductLineItems(),
            isSubpro = false;

        if (!plis) {
            return false;
        }

        for (let i = 0, il = plis.length; i < il; i++) {
            try {
                isSubpro = plis[i].custom.subproSubscriptionSelectedOptionMode === 'regular';
                if (isSubpro)
                    break;
            } catch (e) {}
        }

        return !!isSubpro;
    },

    /**
     * Update the URL Parameter of the Service to include the
     * specified endpoint and any supplied parameters
     *
     * @param svc : HTTPService HTTP Service to update URL on
     * @param endpoint : String API Endpoint to call on the service
     * @param parameters : String GET URL parameters to append to the URL
     */
    setURL: function (svc, endpoint, parameters, credPrefix) {
        if (!credPrefix) {
            credPrefix = 'subpro.http.cred.';
        }

        /**
         * Current Site, used to reference site preferences
         */
        var CurrentSite = require('dw/system/Site').getCurrent();

        svc.setCredentialID(credPrefix + CurrentSite.getCustomPreferenceValue('subproAPICredSuffix'));

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
};

module.exports = SubscribeProLib;