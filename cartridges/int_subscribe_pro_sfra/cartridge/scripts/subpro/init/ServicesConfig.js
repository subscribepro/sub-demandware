var ServicesConfig = {
    oauth: { v1: {}, v2: { token: '/oauth/v2/token' }, v3: {} },
    services: {
        v1: {
            'vaultPaymentprofiles{id}redact': '/services/v1/vault/paymentprofiles/{ID}/redact.json'
        },
        v2: {
            config: '/services/v2/config',
            subscriptions: '/services/v2/subscriptions.json',
            subscription: '/services/v2/subscription.json',
            address: '/services/v2/address.json',
            addresses: '/services/v2/addresses.json',
            'addresses{id}': '/services/v2/addresses/{ID}.json',
            'address-find-or-create': '/services/v2/address/find-or-create.json',
            product: '/services/v2/product.json',
            'product{id}': '/services/v2/products/{ID}.json',
            products: '/services/v2/products.json',
            'batch{batchId}': '/services/v2/batch/{batchId}.json',
            'customers{id}': '/services/v2/customers/{ID}.json',
            customer: '/services/v2/customer.json',
            customers: '/services/v2/customers.json',
            'inventory-location': '/services/v2/inventory-location.json',
            'inventory-locations': '/services/v2/inventory-locations.json',
            'inventory-location{id}': '/services/v2/inventory-locations/{ID}.json',
            inventory: '/services/v2/inventory.json',
            'inventory{id}': '/services/v2/inventory/{ID}.json',
            'vaultPaymentprofiles{id}': '/services/v2/vault/paymentprofiles/{ID}.json',
            vaultPaymentprofiles: '/services/v2/vault/paymentprofiles.json',
            'vaultPaymentprofileExternal-vault': '/services/v2/vault/paymentprofile/external-vault.json'
        },
        v3: { products: '/products.json' }
    },

    getValueByPath: function (path) {
        var keys = path.split('.');
        var value = this;

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (value.hasOwnProperty(key)) {
                value = value[key];
            } else {
                return undefined; // Return undefined if the path is invalid
            }
        }

        return value;
    }
};

module.exports = ServicesConfig;
