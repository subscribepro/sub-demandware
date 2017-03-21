'use strict';

let subscriptionOptions = {
    getOptionsState: function() {
        return {
            'pliUUID': $('.subpro-options.cart').closest('.cart-row').data('uuid'),
            'subscriptionMode': $('.subpro-options.cart input[name=subproSubscriptionOptionMode]:checked').val(),
            'deliveryInteval': $('.subpro-options.cart #delivery-interval').val()
        }
    },

    ajaxUpdateOptions: function(data) {
        $.ajax({
            type: 'POST',
            cache: false,
            contentType: 'application/json',
            url: require('../util').appendParamToURL(Urls.subproSubscriptionOptions, 'options', JSON.stringify(data))
        })
    }
}

module.exports = subscriptionOptions;