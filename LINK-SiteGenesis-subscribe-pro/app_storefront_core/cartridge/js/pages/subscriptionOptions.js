'use strict';

let subscriptionOptions = {
    getOptionsState: (target) => {
        let parent = target.closest('.subpro-options.cart');
        return {
            'pliUUID': parent.closest('.cart-row').data('uuid'),
            'subscriptionMode': parent.find('input[name^=subproSubscriptionOptionMode]:checked').val(),
            'deliveryInteval': parent.find('#delivery-interval').val()
        }
    },

    ajaxUpdateOptions: (data) => {
        $.ajax({
            type: 'POST',
            cache: false,
            contentType: 'application/json',
            url: require('../util').appendParamToURL(Urls.subproSubscriptionOptions, 'options', JSON.stringify(data))
        });
    }
}

module.exports = subscriptionOptions;