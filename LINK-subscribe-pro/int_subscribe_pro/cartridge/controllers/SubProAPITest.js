/**
 * Subscribe Pro API Test Controller
 *
 * This controller provides various end points to fetch and return API responses
 * from the Subscribe Pro RESTful API
 *
 * @module controllers/SubProAPITest
 */
let r = require('/app_storefront_controllers/cartridge/scripts/util/Response');
let SubscribeProLib = require('~/cartridge/scripts/subpro/lib/SubscribeProLib');

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
};

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
};

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
	};

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
	};

	let customerID = httpParameters.get("customer_id").pop(),
		result = SubscribeProLib.updateCustomer(customerID, customer);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.UpdateCustomer.public = true;

/**
 * Calls and return the results of getting an access token from the /token API end-point
 * This method will return a JSON response
 */
exports.GetTokenWidget = function() {
	const httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a customer_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters ||
		!httpParameters.containsKey("customer_id") ||
		!httpParameters.containsKey("grant_type") ||
		!httpParameters.containsKey("scope")) {
		r.renderJSON({
			error: true,
			msg: "The customers API request requires a customer_id, grant_type and scope URL parameters to be set"
		});

		return;
	}

	let customerID = httpParameters.get("customer_id").pop(),
		grantType = httpParameters.get("grant_type").pop(),
		scope = httpParameters.get("scope").pop(),
		result = SubscribeProLib.getToken(customerID, grantType, scope);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.GetTokenWidget.public = true;

/**
 * Calls and return the results of the /vault/paymentprofiles API end-point
 * This method will return a JSON response
 */
exports.GetPaymentProfile = function() {
	const httpParameters = request.httpParameters;

	/**
	 * Check to ensure that a paymentprofile_id has been passed via the HTTP Parameters
	 */
	if (!httpParameters || !httpParameters.containsKey("paymentprofile_id")) {
		r.renderJSON({
			error: true,
			msg: "The paymentprofiles API request requires a paymentprofile_id URL parameter to be set"
		});

		return;
	}

	let paymentProfileID = httpParameters.get("paymentprofile_id").pop(),
		result = SubscribeProLib.getPaymentProfile(paymentProfileID);

	r.renderJSON(result);
}

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.GetPaymentProfile.public = true;

/**
 * Calls and return the results of posting new payment method to the /vault/paymentprofile/external-vault API end-point
 * This method will return a JSON response
 */
exports.SavePaymentProfile = function() {
	let paymentProfile = {
		"customer_id": "761431",
		"payment_token": "ABCD-UNIQUE-PAY-TOKEN",
		"creditcard_type": "visa",
		"creditcard_first_digits": "41111",
		"creditcard_last_digits": "1111",
		"creditcard_month": "3",
		"creditcard_year": "2025",
		"vault_specific_fields": {
			"sfcc": {
				"payment_instrument_id": "12341234123",
				"my_other_field": "stuff"
			}
		},
		"billing_address": {
			"first_name": "Bob",
			"middle_name": "A",
			"last_name": "Jones",
			"company": "Bobs Emporium",
			"street1": "123 Here St",
			"street2": "Apt B",
			"city": "Baltimore",
			"region": "MD",
			"postcode": "21212",
			"country": "US",
			"phone": "410-123-4567"
		}
	};

	let result = SubscribeProLib.createPaymentProfile(paymentProfile);

	r.renderJSON(result);
};

/**
 * Mark the controller endpoint as accessible via the web
 */
exports.SavePaymentProfile.public = true;
