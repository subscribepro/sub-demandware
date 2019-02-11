'use strict';
function toggleDeliveryIntervalDropdown(event, $deliveryInterval) {
    let hideDropdown = $(event.currentTarget).val() !== 'regular';
    $deliveryInterval.attr('hidden', hideDropdown);
}
function serializeURLParams (obj, prefix) {
    var str = [],
        p;
    for (p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p,
                v = obj[p];
            str.push((v !== null && typeof v === "object") ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}


function ajaxUpdateOptions (target, page) {
    let data = subscriptionOptions.getOptionsState(target, page);
    let queryString = serializeURLParams(data);
    $.ajax({
        type: 'POST',
        cache: false,
        contentType: 'application/json',
        url: $('input[name=subproSubscriptionOptionsUrl]').val() + '?' + queryString,
        success: function (res) {
            window.location.reload(true);
        }
    });
}

let subscriptionOptions = {
    cartInit: () => {
        if (!$('body').find('.subpro-options.cart').length) {
            return;
        }
        $('.subpro-options.cart input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', (event) => {
                $(event.currentTarget).parents('.card').spinner().start();
                toggleDeliveryIntervalDropdown(event, $('.subpro-options.cart .delivery-interval-group'));
                $('body').trigger('cartOptionsUpdate', {event: event, page: 'cart'});
                // page is reloaded upon success in AJAX ajaxUpdateOptions
            });

        $('.subpro-options.cart #delivery-interval')
            .off('change')
            .on('change', (event) => {
                $(event.currentTarget).parents('.card').spinner().start();
                $('body').trigger('cartOptionsUpdate', {event: event, page: 'cart'});
            });
    },

    variantInit: () => {
        if (!$('body').find('.subpro-options.pdp').length) {
            return;
        }
        let options = $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]:checked');
        for (let i = 0; i < options.length; i++) {
            let option = $(options[i]);
            option.parent().parent().find('.delivery-interval-group').attr('hidden', option.val() !== 'regular');
        }

        $('.subpro-options.pdp input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', (event) => {
                toggleDeliveryIntervalDropdown(event, $(event.currentTarget).parent().parent().find('.delivery-interval-group'));
                $('body').trigger('pdpOptionsUpdate', {event: event, page: 'pdp'});
            });

        $('.subpro-options.pdp #delivery-interval')
            .off('change')
            .on('change', (event) => {
                $('body').trigger('pdpOptionsUpdate', {event: event, page: 'pdp'});
            });
    },

    getOptionsState: (target, page) => {
        let parent, pliUUID;

        if (page !== 'pdp' && page !== 'cart') {
            return;
        }
        parent = target.closest('.subpro-options.' + page);

        pliUUID = page === 'pdp' ?
            $('button.add-to-cart').data('pid') :
            parent.closest('.product-info').find('.remove-btn').data('pid')
        ;

        return {
            'pliUUID': pliUUID,
            'subscriptionMode': parent.find('input[name^=subproSubscriptionOptionMode]:checked').val(),
            'deliveryInteval': parent.find('#delivery-interval').val(),
            'discount': parent.find('input[name=subproSubscriptionDiscount]').val(),
            'isDiscountPercentage': parent.find('input[name=subproSubscriptionIsDiscountPercentage]').val()
        };
    },

    handleAddToCartSubOptions: () => {
        $(document).on('updateAddToCartFormData', function (e,data) {
            let subOptions = subscriptionOptions.getOptionsState($(document).find('div.subpro-options.pdp'), 'pdp');
            data.pliUUID = subOptions.pliUUID;
            data.subscriptionMode = subOptions.subscriptionMode;
            data.deliveryInteval = subOptions.deliveryInteval;
            data.discount = subOptions.discount;
            data.isDiscountPercentage = subOptions.isDiscountPercentage;
        });
    },

    ajaxUpdateOptions: () => {
        $(document).on('pdpOptionsUpdate cartOptionsUpdate', function (e,p) {
            ajaxUpdateOptions($(p.event.currentTarget), p.page);
        });

        $(document).on('product:afterAddToCart', function (e, data) {
            ajaxUpdateOptions($(document).find('div.subpro-options.pdp'), 'pdp');
        });
    }
};

module.exports = subscriptionOptions;