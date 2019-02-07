'use strict';

function rebuildURL(key, value, url) {
    if (!url) {
        return;
    }
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
}

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

let subscriptionOptions = {
    cartInit: () => {
        if (!$('body').find('.subpro-options.cart').length) {
            return;
        }
        $('.subpro-options.cart input[name^=subproSubscriptionOptionMode]')
            .off('change')
            .on('change', (event) => {
                toggleDeliveryIntervalDropdown(event, $('.subpro-options.cart .delivery-interval-group'));
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'cart'));

                let parents = $(event.currentTarget).parentsUntil(".item-details");
                let editLink = $(parents[parents.length - 1]).parent().find(".item-edit-details a");
                editLink.attr('href', rebuildURL('selectedOptionMode', $(event.currentTarget).val(), editLink.attr("href")));
            });

        $('.subpro-options.cart #delivery-interval')
            .off('change')
            .on('change', (event) => {
                subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState($(event.currentTarget), 'cart'));

                let parents = $(event.currentTarget).parentsUntil(".item-details");
                let editLink = $(parents[parents.length - 1]).parent().find(".item-edit-details a");
                editLink.attr('href', rebuildURL('selectedInterval', $(event.currentTarget).val(), editLink.attr("href")));
            });
    },

    variantInit: () => {
        if (!$('body').find('.subpro-options.pdp').length) {
            return;
        }
        console.log('variantInit');
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
            parent.closest('.cart-row').data('uuid')
        ;

        return {
            'pliUUID': pliUUID,
            'subscriptionMode': parent.find('input[name^=subproSubscriptionOptionMode]:checked').val(),
            'deliveryInteval': parent.find('#delivery-interval').val(),
            'discount': parent.find('input[name=subproSubscriptionDiscount]').val(),
            'isDiscountPercentage': parent.find('input[name=subproSubscriptionIsDiscountPercentage]').val()
        }
    },

    handleAddToCartSubOptions: () => {
        $(document).on('updateAddToCartFormData', function (e,data) {
            let subOptions = subscriptionOptions.getOptionsState($(document).find('div.subpro-options.pdp'), 'pdp');
            data = {...data,...subOptions};
        });
    },

    ajaxUpdateOptions: () => {
        $(document).on('pdpOptionsUpdate cartOptionsUpdate', function (e,p) {
            let data = subscriptionOptions.getOptionsState($(p.event.currentTarget), p.page);
            let queryString = serializeURLParams(data);
            console.log(queryString);
            $.ajax({
                type: 'POST',
                cache: false,
                contentType: 'application/json',
                url: $('input[name=subproSubscriptionOptionsUrl]').val() + '?' + queryString
            });
        });
    }
};

module.exports = subscriptionOptions;