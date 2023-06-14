var ServicesConfig = {
    oauth: { v1: {}, v2: { token: '/oauth/v2/token' }, v3: {} },
    services: {
        v1: {},
        v2: {
            products: '/services/v2/products.json',
            product: '/services/v2/product.json',
            'product{id}': '/services/v2/products/{ID}.json',
            'batch{batchId}': '/services/v2/batch/{batchId}.json',
            'inventory-locations': '/services/v2/inventory-locations.json',
            'inventory-location': '/services/v2/inventory-location.json',
            'inventory-location{ID}': '/services/v2/inventory-locations/{id}.json',
            inventory: '/services/v2/inventory.json',
            'inventory{id}': '/services/v2/inventory/{ID}.json'
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
