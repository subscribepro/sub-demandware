'use strict';

/* eslint no-undef: 0, no-unused-vars: 0 */

/**
 * Toggle the dropdown list of delivery intervals
 * @param {Event} event The event data
 * @param {string} $deliveryInterval The delivery interval element
 */
function toggleDeliveryIntervalDropdown(event, $deliveryInterval) {
    var hideDropdown = $(event.currentTarget).val() !== 'regular';
    $deliveryInterval.attr('hidden', hideDropdown);
}

/**
 * Serialize the URL parameters
 * @param {Object} obj URL object
 * @param {string} prefix Prefix
 * @return {string} The serialized parameters
 */
function serializeURLParams(obj, prefix) {
    var str = [];
    var p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + '[' + p + ']' : p;
            var v = obj[p];
            str.push((v !== null && typeof v === 'object')
                ? serialize(v, k)
                : encodeURIComponent(k) + '=' + encodeURIComponent(v));
        }
    }
    return str.join('&');
}

/**
 * @param {DOMElement} context DOM context to use
 */
function showMinimumFrequencyWarning(context) {
    $(context).siblings('.error').empty();
    var enteredVal = parseInt($(context).val());
    var minAllowed = parseInt($(context).attr('min'));
    if (enteredVal < minAllowed) {
        var plural = enteredVal !== 1;
        $(context).siblings('.error').append('<p>You have selected to receive this product every ' + enteredVal + ' day' + (plural ? 's' : '') + '. If this is not correct, please update your Auto-Ship frequency.</p>');
    }
}

var subscriptionOptions = {
    cartInit: function () {
        if (!$('body').find('.subpro-options.cart').length) {
            return;
        }
        // remove on click handler for delete. it gets added back again when cart/cart.js is
        // added in the base cart.js client script.
        $('body').off('click', '.cart-delete-confirmation-btn');

        $('.subpro-options.cart input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', function (event) {
                $(event.currentTarget).parents('.card').spinner().start();
                toggleDeliveryIntervalDropdown(event, $('.subpro-options.cart .delivery-interval-group'));
                $('body').trigger('cartOptionsUpdate', { event: event, page: 'cart' });
                // page is reloaded upon success in AJAX ajaxUpdateOptions
            });

        $('.subpro-options.cart #delivery-interval')
            .off('change')
            .on('change', function (event) {
                $(event.currentTarget).parents('.card').spinner().start();
                $('body').trigger('cartOptionsUpdate', { event: event, page: 'cart' });
                // page is reloaded upon success in AJAX ajaxUpdateOptions
            });

        $('.subpro-options.cart #delivery-periods')
            .off('change')
            .on('change', function (event) {
                showMinimumFrequencyWarning(this);
                $('body').trigger('cartOptionsUpdate', { event: event, page: 'cart' });
            });

        showMinimumFrequencyWarning($('.subpro-options.cart #delivery-periods'));
    },

    variantInit: function () {
        if (!$('body').find('.subpro-options.pdp').length) {
            return;
        }
        var options = $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]:checked');
        for (var i = 0; i < options.length; i++) {
            var option = $(options[i]);
            option.parent().parent().find('.delivery-interval-group').attr('hidden', option.val() !== 'regular');
        }

        $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', function (event) {
                toggleDeliveryIntervalDropdown(event, $(event.currentTarget).parent().parent().find('.delivery-interval-group'));
                $('body').trigger('pdpOptionsUpdate', { event: event, page: 'pdp' });
            });

        $('.subpro-options.pdp #delivery-interval')
            .off('change')
            .on('change', function (event) {
                $('body').trigger('pdpOptionsUpdate', { event: event, page: 'pdp' });
            });
        $('.subpro-options.pdp #delivery-periods')
            .off('change')
            .on('change', function (event) {
                showMinimumFrequencyWarning(this);
                $('body').trigger('pdpOptionsUpdate', { event: event, page: 'pdp' });
            });
    },

    getOptionsState: function (target, page) {
        var parent;
        var pliUUID;

        if (page !== 'pdp' && page !== 'cart') {
            return;
        }
        parent = target.closest('.subpro-options.' + page);

        if (page === 'pdp') {
            pliUUID = parent.siblings('input[name=subproSubscriptionProductId]').val();
        } else {
            pliUUID = parent.closest('.product-info').find('button.remove-product').data('pid');
        }

        return {
            pliUUID: pliUUID,
            subscriptionMode: $(document).find('input[name^=subproSubscriptionOptionMode]:checked').val(),
            deliveryInteval: parent.find('#delivery-interval').val(),
            deliveryNumPeriods: parent.find('#delivery-periods').val(),
            discount: parent.siblings('input[name=subproSubscriptionDiscount]').val(),
            isDiscountPercentage: parent.siblings('input[name=subproSubscriptionIsDiscountPercentage]').val()
        };
    },

    handleAddToCartSubOptions: function () {
        $(document).on('updateAddToCartFormData', function (e, data) {
            var subOptions = subscriptionOptions.getOptionsState($(document).find('div.subpro-options.pdp'), 'pdp');
            data.pliUUID = subOptions.pliUUID;
            data.subscriptionMode = subOptions.subscriptionMode;
            data.deliveryInteval = subOptions.deliveryInteval;
            data.deliveryNumPeriods = subOptions.deliveryNumPeriods;
            data.discount = subOptions.discount;
            data.isDiscountPercentage = subOptions.isDiscountPercentage;
        });
    },

    ajaxUpdateOptions: function () {
        $('body').on('product:afterAttributeSelect', function (e, response) {
            $('input[name=subproSubscriptionProductId]').val(response.data.product.id);
        });

        $(document).on('pdpOptionsUpdate cartOptionsUpdate', function (e, p) {
            ajaxUpdateOptions($(p.event.currentTarget), p.page); // eslint-disable-line
        });

        $(document).on('product:afterAddToCart', function (e, data) {
            ajaxUpdateOptions($(document).find('div.subpro-options.pdp'), 'pdp'); // eslint-disable-line
        });
    }
};

/**
 * Update subscription options via AJAX when they are changed
 * @param {string} target DOM target we can use for getting the option state
 * @param {string} page The current page (pdp or cart)
 */
function ajaxUpdateOptions(target, page) {
    var data = subscriptionOptions.getOptionsState(target, page);
    var queryString = serializeURLParams(data);
    $.ajax({
        type: 'POST',
        cache: false,
        contentType: 'application/json',
        url: $('input[name=subproSubscriptionOptionsUrl]').val() + '?' + queryString,
        success: function () {
            if (page == 'cart') {
                window.location.reload(true);
            }
        }
    });
}

module.exports = subscriptionOptions;
