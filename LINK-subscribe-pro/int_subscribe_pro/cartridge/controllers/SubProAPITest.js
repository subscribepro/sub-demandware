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