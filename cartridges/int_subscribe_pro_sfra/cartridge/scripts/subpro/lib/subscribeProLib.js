var HttpServices = require('~/cartridge/scripts/subpro/init/httpServiceInit.js');
var Encoding = require('dw/crypto/Encoding');
var Logger = require('dw/system/Logger');

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
            var jsonObject = null;

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
     * Fetches object definition from Custom Object, creating it if not exists
     * @param {string} customObjectName
     * @param {string} objectID
     * @param {boolean} [createIfNotExists]
     * @returns {dw.object.CustomAttributes}
     */
    getCustomObject: function (customObjectName, objectID, createIfNotExists) {
        var CustomObjectMgr = require('dw/object/CustomObjectMgr'),
            objectDefinition = CustomObjectMgr.getCustomObject(customObjectName, objectID);
        if (empty(objectDefinition) && createIfNotExists === true) {
            require('dw/system/Transaction').wrap(function () {
                objectDefinition = CustomObjectMgr.createCustomObject(customObjectName, objectID);
            });
        }
        if (!empty(objectDefinition)) {
            return objectDefinition.getCustom();
        }
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
     * Get all products
     * API Endpoint: GET /services/v2/products.{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getProducts: function () {
        // var service = SubscribeProLib.getService('subpro.http.get.products');
        // return this.handleResponse(service.call({ sku: '' }));
        var service = HttpServices.SubproHttpService();
        // var config = { accessToken: session.privacy.subProAccessToken, actionId: 'services.v2.product{id}', dynamicAction: { ID: '555' }, method: 'GET', parameters: 'QueryString', payload: 'Object' };
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v2.products', method: 'GET' };
        return this.handleResponse(service.call(config));
        // return this.handleResponse(service.call({ sku: sku, accessToken: accessToken }));
    },

    /**
     * Get all products
     * API Endpoint: GET /services/v2/products.{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getFilteredProducts: function (sku) {
        if (empty(sku)) {
            return {
                error: true,
                result: 'filteringString is required for the getFilteredProducts method'
            };
        }
        // var service = SubscribeProLib.getService('subpro.http.get.filtered.products');
        var service = HttpServices.SubproHttpService();
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v3.products', method: 'GET', parameters: sku };

        return this.handleResponse(service.call(config));
    },

    /**
     * Post all products
     * API Endpoint: POST /services/v2/products.{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postProducts: function (products) {
        // return SubscribeProLib.handleResponse(service.call({ customer: customer }));
        var service = HttpServices.SubproHttpService();
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v2.products', method: 'POST', payload: { products: products } };

        return this.handleResponse(service.call(config));
    },

    /**
     * Post a single product
     * API Endpoint: POST /services/v2/product{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postProduct: function (product) {
        // return SubscribeProLib.handleResponse(service.call({ customer: customer }));
        var service = HttpServices.SubproHttpService();
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v2.product', method: 'POST', payload: { product: product } };

        return this.handleResponse(service.call(config));
    },

    /**
     * Patch all products
     * API Endpoint: PATCH /services/v2/products.{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    patchProducts: function (listFields) {
        var service = HttpServices.SubproHttpService();
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v2.products', method: 'PATCH', payload: listFields };

        return this.handleResponse(service.call(config));
    },

    /**
     * Retrieve a batch status.
     * API Endpoint: GET /services/v2/batch/{batchId}.{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getBatchStatus: function (batchId) {
        var service = HttpServices.SubproHttpService();
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v2.batch{batchId}', dynamicAction: { batchId: batchId }, method: 'GET' };

        return this.handleResponse(service.call(config));
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
        if (!grantType || !scope) {
            return {
                error: true,
                result: 'grantType or scope parameter is missing'
            };
        }

        var service = HttpServices.SubproHttpService();

        var config = {
            actionId: 'oauth.v2.token',
            method: 'GET',
            parameters: 'grant_type=' + grantType + '&scope=' + scope + '&customer_id=' + Encoding.toURI(customerID)
        };
        return this.handleResponse(service.call(config));
    },

    /**
     * getOrUpdateAccessToken
     * @returns {string} token
     */

    getOrUpdateAccessToken() {
        var subProAccessToken = this.getCustomObject('subProAccessToken', 'token', true);

        if (subProAccessToken && (!subProAccessToken.expiresOn || !subProAccessToken.token || Date.now() >= subProAccessToken.expiresOn)) {
            var response = this.getToken('', 'client_credentials', 'client');
            try {
                require('dw/system/Transaction').wrap(function () {
                    if (response.error) {
                        delete subProAccessToken.token;
                        delete subProAccessToken.expiresOn;
                    } else {
                        var expirationTime = new Date().setTime(Date.now() + response.result.expires_in * 100);
                        subProAccessToken.token = response.result.access_token;
                        subProAccessToken.expiresOn = expirationTime;
                    }
                });
            } catch (e) {
                Logger.error('subProAccessToken has not saved. error: ', e);
            }
        }
        return subProAccessToken.token;
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
    isBasketHasSubscriptionItem: function () {
        var BasketMgr = require('dw/order/BasketMgr');
        var basket = BasketMgr.getCurrentBasket();
        if (empty(basket)) {
            return false;
        }
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
    },

    /**
     * Call service to delete payment profile.
     *
     * @param {string} subproPaymentProfileID Subscribe Pro Payment Profile ID
     */
    deletePaymentProfile: function (paymentProfileID) {
        var service = SubscribeProLib.getService('subpro.http.delete.paymentprofile.vault');
        var params = {};
        if (paymentProfileID) {
            params = { paymentprofile_id: paymentProfileID };
        }

        return this.handleResponse(service.call(params), { serviceId: service.getConfiguration().getID() });
    },

    /**
     * Retrieve a collection of all inventory locations.
     *
     * API Endpoint: GET /services/v2/inventory-locations.{_format}
     *
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    getInventoryLocations: function () {
        var service = HttpServices.SubproHttpService();
        var config = { accessToken: this.getOrUpdateAccessToken(), actionId: 'services.v2.inventory-locations', method: 'GET' };

        return this.handleResponse(service.call(config));
    },

    /**
     * Create a new inventory location.
     *
     * API Endpoint: POST /services/v2/inventory-locations.{_format}
     *
     * @param {Object} listID id of the inventory list on SFCC side
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postInventoryLocation: function (listID) {
        var service = HttpServices.SubproHttpService();
        var config = {
            accessToken: this.getOrUpdateAccessToken(),
            actionId: 'services.v2.inventory-location',
            method: 'POST',
            payload: {
                inventory_location: {
                    name: listID,
                    location_code: listID
                }
            }
        };
        return this.handleResponse(service.call(config));
    },

    /**
     * Update a new inventory location.
     *
     * API Endpoint: POST /services/v2/inventory-locations/{id}.{_format}
     *
     * @param {Object} listID id of the inventory list on SFCC side
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    updateInventoryLocation: function (listID) {
        var service = HttpServices.SubproHttpService();
        var config = {
            accessToken: this.getOrUpdateAccessToken(),
            actionId: 'services.v2.inventory-location{ID}',
            method: 'POST',
            dynamicAction: { ID: listID },
            payload: {
                inventory_location: {
                    name: listID,
                    location_code: listID
                }
            }
        };
        return this.handleResponse(service.call(config));
    },

    /**
     * Create a new inventory entry.
     *
     * API Endpoint: POST /services/v2/inventory.{_format}
     *
     * @param {Object} data An object containing all configs and request fields
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    postInventoryRecord: function (data) {
        var service = HttpServices.SubproHttpService();
        var config = {
            accessToken: this.getOrUpdateAccessToken(),
            actionId: 'services.v2.inventory',
            method: 'POST',
            payload: {
                inventory: {
                    product_id: data.product_id,
                    inventory_location_id: data.inventory_location_id,
                    qty_in_stock: data.qty_in_stock,
                    qty_available: data.qty_available,
                    qty_reserved: data.qty_reserved,
                    is_in_stock: data.is_in_stock
                }
            }
        };

        return this.handleResponse(service.call(config));
    },

    /**
     * Update a single inventory entry.
     *
     * API Endpoint: POST /services/v2/locations/{id}.{_format}
     *
     * @param {Object} data An object containing all configs and request fields
     * @returns {Object} An object containing whether or not this service returned an error and the results of the API request
     */
    updateInventoryRecord: function (data) {
        var service = HttpServices.SubproHttpService();
        var config = {
            accessToken: this.getOrUpdateAccessToken(),
            actionId: 'services.v2.inventory{id}',
            method: 'POST',
            dynamicAction: { ID: data.SPInventoryEntryID },
            payload: {
                inventory: {
                    qty_in_stock: data.qty_in_stock,
                    qty_available: data.qty_available,
                    qty_reserved: data.qty_reserved,
                    is_in_stock: data.is_in_stock
                }
            }
        };

        return this.handleResponse(service.call(config));
    }
};

module.exports = SubscribeProLib;
