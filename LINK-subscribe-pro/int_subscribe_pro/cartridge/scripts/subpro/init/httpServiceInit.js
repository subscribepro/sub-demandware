/**
 * Initialize HTTP services for a cartridge
 */
importPackage(dw.svc);
importPackage(dw.net);
importPackage(dw.io);

/**
 * Mock Data
 */
let ConfigMockData = require("../mock_data/ConfigMockData");
let SubscriptionsMockData = require("../mock_data/SubscriptionsMockData");
let AddressMockData = require("../mock_data/AddressMockData");
let AddressesMockData = require("../mock_data/AddressesMockData");
let ProductMockData = require("../mock_data/ProductMockData");

/**
 * Service: subpro.http.get.config
 */
ServiceRegistry.configure("subpro.http.get.config", {
	/**
	 * Create the service request
	 * - Set request method to be the HTTP GET method
	 * - Append the customer as a URL parameter
	 */
	createRequest: function(svc: HTTPService, args) {
		svc.setRequestMethod("GET");

		let url = svc.getURL();
		url = url.replace("{ENDPOINT}", "config");
		url = url.replace("{PARAMS}", "");

		svc.setURL(url);
	},

	/**
	 * JSON parse the response text and return it
	 */
	parseResponse: function(svc: HTTPService, client: HTTPClient) {
		return JSON.parse(client.text);
	},

	/**
	 * Return the Mocked Config Data
	 */
	mockCall: function(svc: HTTPService, client: HTTPClient) {
		return {
			statusCode: 200,
			statusMessage: "Success",
			text: JSON.stringify(ConfigMockData)
		};
	}
});

/**
 * Service: subpro.http.get.subscriptions
 */
ServiceRegistry.configure("subpro.http.get.subscriptions", {
	/**
	 * Create the service request
	 * - Set request method to be the HTTP GET method
	 * - Append the customer as a URL parameter
	 */
	createRequest: function(svc: HTTPService, args) {
		svc.setRequestMethod("GET");

		let url = svc.getURL();
		url = url.replace("{ENDPOINT}", "subscriptions");
		url = url.replace("{PARAMS}", "customer_id=" + args.customer_id);

		svc.setURL(url);
	},

	/**
	 * JSON parse the response text and return it
	 */
	parseResponse: function(svc: HTTPService, client: HTTPClient) {
		return JSON.parse(client.text);
	},

	/**
	 * Return the Mocked Subscriptions Data
	 */
	mockCall: function(svc: HTTPService, client: HTTPClient) {
		return {
			statusCode: 200,
			statusMessage: "Success",
			text: JSON.stringify(SubscriptionsMockData)
		};
	}
});

function setURL(svc, endpoint, parameters) {
	/**
	 * Replace the URL parameters with the relevant values
	 */
	let url = svc.getURL();
	url = url.replace("{ENDPOINT}", endpoint);
	url = url.replace("{PARAMS}", parameters);

	/**
	 * Save the newly constructed url
	 */
	svc.setURL(url);
}

function getMockJSON(data) {
	return {
		statusCode: 200,
		statusMessage: "Success",
		text: JSON.stringify(data)
	};
}

/**
 * Service: subpro.http.post.addresses
 */
ServiceRegistry.configure("subpro.http.post.addresses", {
	/**
	 * Create the service request
	 */
	createRequest: function(svc: HTTPFormService, args) {
		/**
		 * Since the service type is HTTP Form, this is unnecessary but was added anyway to show the functionality
		 */
		svc.setRequestMethod("POST");

		/**
		 * Setup the URL
		 */
		if (args.address_id) {
			setURL(svc, "addresses/" + args.address_id, "");
		} else {
			setURL(svc, "addresses", "");
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
	parseResponse: function(svc: HTTPService, client: HTTPClient) {
		return JSON.parse(client.text);
	},

	/**
	 * Return the Mocked Address Data
	 */
	mockCall: function(svc: HTTPService, client: HTTPClient) {
		return getMockJSON(AddressMockData);
	}
});

/**
 * Service: subpro.http.get.addresses
 */
ServiceRegistry.configure("subpro.http.get.addresses", {
	/**
	 * Create the service request
	 */
	createRequest: function(svc: HTTPFormService, args) {
		svc.setRequestMethod("GET");
		setURL(svc, "addresses.json", "customer_id=" + args.customer_id);
	},

	/**
	 * JSON parse the response text and return it
	 */
	parseResponse: function(svc: HTTPService, client: HTTPClient) {
		return JSON.parse(client.text);
	},

	/**
	 * Return the Mocked Address Data
	 */
	mockCall: function(svc: HTTPService, client: HTTPClient) {
		return getMockJSON(AddressesMockData);
	}
});

/**
 * Service: subpro.http.get.products
 */
ServiceRegistry.configure("subpro.http.get.products", {
	/**
	 * Create the service request
	 */
	createRequest: function(svc: HTTPFormService, args) {
		svc.setRequestMethod("GET");
		setURL(svc, "products.json", "sku=" + args.sku);
	},

	/**
	 * JSON parse the response text and return it
	 */
	parseResponse: function(svc: HTTPService, client: HTTPClient) {
		return JSON.parse(client.text);
	},

	/**
	 * Return the Mocked Address Data
	 */
	mockCall: function(svc: HTTPService, client: HTTPClient) {
		return getMockJSON(ProductMockData);
	}
});