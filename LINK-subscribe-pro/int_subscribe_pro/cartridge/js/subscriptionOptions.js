'use strict';

let util = require('../../../../LINK-SiteGenesis-subscribe-pro/app_storefront_core/cartridge/js/util.js');
let subscriptionOptions = {
	cartInit: () => {
	    $('.subpro-options.cart input[name^=subproSubscriptionOptionMode]')
        .off('change')
        .on('change', (event) => {
            subscriptionOptions.toggleDeliveryIntervalDropdown(event, $('.subpro-options.cart .delivery-interval-group'));
            subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget)));
        });

    $('.subpro-options.cart #delivery-interval')
        .off('change')
        .on('change', (event) => subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget))));
	},
	variantInit: () => {
	    let options = $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]:checked');

	    for (let i = 0; i < options.length; i++) {
            let option = $(options[i]);
            
            if (option.val() === 'regular') {
                option.parent().parent().find('.delivery-interval-group').attr('hidden', false);
            } else {
                option.parent().parent().find('.delivery-interval-group').attr('hidden', true);
            }
        }
	    
	    $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]')
	    .off('change')
	    .on('change', (event) => subscriptionOptions.toggleDeliveryIntervalDropdown(event, $(event.currentTarget).parent().parent().find('.delivery-interval-group')));
	},
	
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
            url: util.appendParamToURL(Urls.subproSubscriptionOptions, 'options', JSON.stringify(data))
        });
    },

    toggleDeliveryIntervalDropdown: (event, $deliveryInterval) => {
        $(event.currentTarget).val() === 'regular'
            ? $deliveryInterval.attr('hidden', false)
            : $deliveryInterval.attr('hidden', true);
    }
};

module.exports = subscriptionOptions;
