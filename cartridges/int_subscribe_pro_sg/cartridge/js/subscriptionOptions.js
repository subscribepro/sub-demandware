'use strict';

/* eslint no-undef: 0 */

var util = require('./util.js');

var subscriptionOptions = {
    cartInit: function () {
        $('.subpro-options.cart input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', function (event) {
                subscriptionOptions.toggleDeliveryIntervalDropdown(event, $('.subpro-options.cart .delivery-interval-group'));
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'cart'));
            });

        $('.subpro-options.cart #delivery-interval')
            .off('change')
            .on('change', function (event) {
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'cart'));
            });
    },

    variantInit: function () {
        var options = $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]:checked');

        for (var i = 0; i < options.length; i++) {
            var option = $(options[i]);

            if (option.val() === 'regular') {
                option.parent().parent().find('.delivery-interval-group').attr('hidden', false);
            } else {
                option.parent().parent().find('.delivery-interval-group').attr('hidden', true);
            }
        }

        $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', function (event) {
                subscriptionOptions.toggleDeliveryIntervalDropdown(event, $(event.currentTarget).parent().parent().find('.delivery-interval-group'));
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'pdp'));
            });

        $('.subpro-options.pdp #delivery-interval')
            .off('change')
            .on('change', function (event) {
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'pdp'));
            });
    },

    getOptionsState: function (target, page) {
        var parent;
        var pliUUID;
        if (page === 'pdp') {
            parent = target.closest('.subpro-options.pdp');
            pliUUID = $('div.product-number span').html();
        } else if (page == 'cart') {
            parent = target.closest('.subpro-options.cart');
            pliUUID = parent.find('input[name^=subproProductLineItemID]').val();
        } else {
            return;
        }

        return {
            pliUUID: pliUUID,
            subscriptionMode: parent.find('input[name^=subproSubscriptionOptionMode]:checked').val(),
            deliveryInterval: parent.find('#delivery-interval').val(),
            discount: parent.find('input[name=subproSubscriptionDiscount]').val(),
            isDiscountPercentage: parent.find('input[name=subproSubscriptionIsDiscountPercentage]').val()
        };
    },

    ajaxUpdateOptions: function (data) {
        $.ajax({
            type: 'POST',
            cache: false,
            contentType: 'application/json',
            url: util.appendParamToURL(Urls.subproSubscriptionOptions, 'options', JSON.stringify(data))
        });
    },

    rebuildURL: function (key, value, url) {
        var urlParts = url.split('?');
        var queryParams = urlParts[1].split('&');

        for (var i = 0; i < queryParams.length; i++) {
            var queryParam = queryParams[i];

            if (queryParam.indexOf(key) > -1) {
                queryParam = key + '=' + value;
                queryParams[i] = queryParam;
            }
        }
        urlParts[1] = queryParams.join('&');

        return urlParts.join('?');
    },

    toggleDeliveryIntervalDropdown: function (event, $deliveryInterval) {
        $(event.currentTarget).val() === 'regular'
            ? $deliveryInterval.attr('hidden', false)
            : $deliveryInterval.attr('hidden', true);
    }
};

module.exports = subscriptionOptions;
