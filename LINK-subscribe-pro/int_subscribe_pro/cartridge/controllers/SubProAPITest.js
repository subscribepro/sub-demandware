/**
 * Subscribe Pro API Test Controller
 *
 * This controller provides various end points to fetch and return API responses
 * from the Subscribe Pro RESTful API
 *
 * @module controllers/SubProAPITest
 */
let r = require('/app_storefront_controllers/cartridge/scripts/util/Response');
let SubscribeProLib = require("~/cartridge/scripts/subpro/lib/SubscribeProLib");

/**
 * Calls and return the results of the /config API end-point
 * This method will return a JSON response
 */
exports.Config = function() {
	let result = SubscribeProLib.getConfig();
	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.Config.public = true;

/**
 * Calls and return the results of the /subscriptions API end-point
 * This method will return a JSON response
 */
exports.Subscriptions = function() {
	let httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a customer_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("customer_id")) {
		r.renderJSON({
			error: true,
			msg: "The subscriptions API request requires a customer_id URL parameter to be set"
		});

		return;
	}

	let customerID = httpParameters.get("customer_id").pop();
	let result = SubscribeProLib.getSubscription(customerID);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.Subscriptions.public = true;

/**
 * Calls and return the results of creating new subscription at the /subscription API end-point
 * This method will return a JSON response
 */
exports.CreateSubscription = function() {
	let subscription = {
		"customer_id":"761431",
		"payment_profile_id":1041328,
		"requires_shipping": true,
		"shipping_address":{
			"first_name":"Test",
			"last_name":"User",
		},
		"product_sku":"test-product",
		"qty":1,
		"use_fixed_price":false,
		"interval":"Every 2 Months",
		"next_order_date":"2017-04-23"
	};

	let result = SubscribeProLib.postSubscription(subscription);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.CreateSubscription.public = true;

/**
 * Calls and return the results of posting and updated address to the /addresses API end-point
 * This method will return a JSON response
 */
exports.Addresses = function() {
	let httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a address_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("address_id")) {
		r.renderJSON({
			error: true,
			msg: "The addresses API request requires a address_id URL parameter to be set"
		});

		return;
	}

	let addressID = httpParameters.get("address_id").pop();

	let address = {
		"first_name": "Foo",
		"middle_name": "",
		"last_name": "Date: " + new Date().toISOString(),
		"street1": "123 Main Street",
		"street2": "Apt 1F",
		"city": "Baltimore",
		"region": "MD",
		"postcode": "22222",
		"country": "United States",
		"phone": "1234567890"
	};

	let result = SubscribeProLib.postUpdateAddress(addressID, address);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.Addresses.public = true;

/**
 * Calls and return the results of creating a new address to the /address API end-point
 * This method will return a JSON response
 */
exports.CreateAddress = function() {
	let address = {
		"customer_id": "761431",
		"first_name": "Foo",
		"middle_name": "",
		"last_name": "Date: " + new Date().toISOString(),
		"street1": "123 Main Street",
		"street2": "Apt 1F",
		"city": "Baltimore",
		"region": "MD",
		"postcode": "22222",
		"country": "United States",
		"phone": "1234567890"
	};

	let result = SubscribeProLib.postCreateAddress(address);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.CreateAddress.public = true;

/**
 * Calls and return the results of finding or creating address at the /address/find-or-create API end-point
 * This method will return a JSON response
 */
exports.FindCreateAddress = function() {
	let address = {
		"customer_id": 761431,
		"first_name": "Foo",
		"last_name": "Date: " + new Date().toISOString(),
		"street1": "123 Main Street",
		"street2": "Apt 1F",
		"city": "Baltimore",
		"region": "MD",
		"postcode": "22222",
		"country": "United States",
		"phone": "1234567890"
	};

	let result = SubscribeProLib.findCreateAddress(address);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.FindCreateAddress.public = true;

/**
 * Calls and return the results of the /addresses API end-point
 * This method will return a JSON response
 */
exports.GetAddresses = function() {
	let httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a customer_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("customer_id")) {
		r.renderJSON({
			error: true,
			msg: "The addresses API request requires a customer_id URL parameter to be set"
		});

		return;
	}

	let customerID = httpParameters.get("customer_id").pop(),
		result = SubscribeProLib.getAddresses(customerID);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.GetAddresses.public = true;

/**
 * Calls and return the results of the /product API end-point
 * This method will return a JSON response
 */
exports.Products = function() {
	const httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a sku has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("sku")) {
		r.renderJSON({
			error: true,
			msg: "The product API request requires a sku URL parameter to be set"
		});

		return;
	}

	let sku = httpParameters.get("sku").pop(),
		result = SubscribeProLib.getProduct(sku);

	r.renderJSON(result);
}

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.Products.public = true;

/**
 * Calls and return the results of the /customers API end-point
 * This method will return a JSON response
 */
exports.Customers = function() {
	const httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a customer_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("customer_id")) {
		r.renderJSON({
			error: true,
			msg: "The customers API request requires a customer_id URL parameter to be set"
		});

		return;
	}

	let customerID = httpParameters.get("customer_id").pop(),
		result = SubscribeProLib.getCustomer(customerID);

	r.renderJSON(result);
}

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.Customers.public = true;

/**
 * Calls and return the results of posting new customer to the /customer API end-point
 * This method will return a JSON response
 */
exports.Customer = function() {
	let customer = {
		"email": "test@mail.com",
		"first_name": "Name",
		"last_name": "Surname",
		"middle_name": "mid",
		"magento_customer_id": 1
	}

	let result = SubscribeProLib.createCustomer(customer);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.Customer.public = true;


/**
 * Calls and return the results of posting an updated customer to the /customer API end-point
 * This method will return a JSON response
 */
exports.UpdateCustomer = function() {
	const httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a customer_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("customer_id")) {
		r.renderJSON({
			error: true,
			msg: "The customers API request requires a customer_id URL parameter to be set"
		});

		return;
	}

	let customer = {
		"email": "test@mail.com",
		"first_name": "Name",
		"last_name": "Surname",
		"middle_name": "mid",
		"magento_customer_id": 1
	}

	let customerID = httpParameters.get("customer_id").pop(),
		result = SubscribeProLib.updateCustomer(customerID, customer);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.UpdateCustomer.public = true;