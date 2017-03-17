importPackage( dw.svc );

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
	getCustomer: function(customerID) {
		if (!customerID) {
			return {
				error: true,
				result: "customerID is required for the getCustomer method"
			}
		}

		let service = SubscribeProLib.getService("subpro.http.get.customers");

		return SubscribeProLib.handleResponse(service.call({customer_id: customerID}));
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
	 * Check if customer is registered. This is necessary to proceed to checkout with SubPro subscription
	 *
	 * @return boolean if customer is registered
	 */
	isCheckoutPermitted: function() {
		return customer.authenticated && customer.registered;
	},

	/**
	 * Check if cart has Product Line Items with SubPro subscription
	 *
	 * @return boolean if cart has items SubPro subscription
	 */
	isSubPro: function() {
		const app = require('/app_storefront_controllers/cartridge/scripts/app');
		let cart = app.getModel('Cart').get(),
			plis = cart.getProductLineItems(),
			isSubpro = false;

		for (let i = 0, il = plis.length; i < il; i++) {
			try {
				isSubpro = plis[i].custom.subproSubscriptionOptionMode;
				if (isSubpro)
					break;
			} catch (e) { }
		}

		return !!isSubpro;
	}
};

module.exports = SubscribeProLib;
