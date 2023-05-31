var ServicesConfig = {
    oauth: { v1: {}, v2: { token: '/oauth/v2/token' }, v3: {} },
    services: {
        v1: {},
        v2: { products: '/services/v2/products.json', product: '/services/v2/products.json', 'product{id}': '/services/v2/products/{ID}.json' },
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
