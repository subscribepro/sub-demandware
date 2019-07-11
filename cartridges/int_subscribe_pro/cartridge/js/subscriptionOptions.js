'use strict';

let util = require('./util.js');

let subscriptionOptions = {
    cartInit: () => {
        $('.subpro-options.cart input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', (event) => {
                subscriptionOptions.toggleDeliveryIntervalDropdown(event, $('.subpro-options.cart .delivery-interval-group'));
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'cart'));

                let parents = $(event.currentTarget).parentsUntil(".item-details");
                let editLink = $(parents[parents.length - 1]).parent().find(".item-edit-details a");
                editLink.attr('href', subscriptionOptions.rebuildURL('selectedOptionMode', $(event.currentTarget).val(), editLink.attr("href")));
            });

        $('.subpro-options.cart #delivery-interval')
            .off('change')
            .on('change', (event) => {
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'cart'));

                let parents = $(event.currentTarget).parentsUntil(".item-details");
                let editLink = $(parents[parents.length - 1]).parent().find(".item-edit-details a");
                editLink.attr('href', subscriptionOptions.rebuildURL('selectedInterval', $(event.currentTarget).val(), editLink.attr("href")));
            });
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
            .on('change', (event) => {
                subscriptionOptions.toggleDeliveryIntervalDropdown(event, $(event.currentTarget).parent().parent().find('.delivery-interval-group'));
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'pdp'));
            });

        $('.subpro-options.pdp #delivery-interval')
            .off('change')
            .on('change', (event) => subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'pdp')));
    },

    getOptionsState: (target, page) => {
        let parent, pliUUID;

        if (page === 'pdp') {
            parent = target.closest('.subpro-options.pdp');
            pliUUID = parent.closest('.product-add-to-cart').find('input[name=uuid]').val()
        } else if (page == 'cart') {
            parent = target.closest('.subpro-options.cart');
            pliUUID = parent.closest('.cart-row').data('uuid')
        } else {
            return;
        }

        return {
            'pliUUID': pliUUID,
            'subscriptionMode': parent.find('input[name^=subproSubscriptionOptionMode]:checked').val(),
            'deliveryInteval': parent.find('#delivery-interval').val(),
            'discount': parent.find('input[name=subproSubscriptionDiscount]').val(),
            'isDiscountPercentage': parent.find('input[name=subproSubscriptionIsDiscountPercentage]').val()
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

    rebuildURL: (key, value, url) => {
        let urlParts = url.split('?');
        let queryParams = urlParts[1].split('&');

        for (let i = 0; i < queryParams.length; i++) {
            let queryParam = queryParams[i];

            if (queryParam.indexOf(key) > -1) {
                queryParam = key + '=' + value;
                queryParams[i] = queryParam;
            }
        }
        urlParts[1] = queryParams.join('&');

        return urlParts.join('?');
    },

    toggleDeliveryIntervalDropdown: (event, $deliveryInterval) => {
        $(event.currentTarget).val() === 'regular'
            ? $deliveryInterval.attr('hidden', false)
            : $deliveryInterval.attr('hidden', true);
    }
};

module.exports = subscriptionOptions;
