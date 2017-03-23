'use strict';

var account = require('./account'),
    bonusProductsView = require('../bonus-products-view'),
    quickview = require('../quickview'),
    cartStoreInventory = require('../storeinventory/cart'),
    subscriptionOptions = require('./subscriptionOptions');

/**
 * @private
 * @function
 * @description Binds events to the cart page (edit item's details, bonus item's actions, coupon code entry)
 */
function initializeEvents() {
    $('#cart-table').on('click', '.item-edit-details a', function (e) {
        e.preventDefault();
        quickview.show({
            url: e.target.href,
            source: 'cart'
        });
    })
    .on('click', '.bonus-item-actions a, .item-details .bonusproducts a', function (e) {
        e.preventDefault();
        bonusProductsView.show(this.href);
    });

    // override enter key for coupon code entry
    $('form input[name$="_couponCode"]').on('keydown', function (e) {
        if (e.which === 13 && $(this).val().length === 0) {
            return false;
        }
    });

    //to prevent multiple submissions of the form when removing a product from the cart
    var removeItemEvent = false;
    $('button[name$="deleteProduct"]').on('click', function (e) {
        if (removeItemEvent) {
            e.preventDefault();
        } else {
            removeItemEvent = true;
        }
    });

    $('.subpro-options.cart input[name=subproSubscriptionOptionMode]').on('change', (event) => {
        let $deliveryInteval = $('.subpro-options.cart #delivery-interval');

        $(event.currentTarget).val() === 'regular'
            ? $deliveryInteval.prop('disabled', false)
            : $deliveryInteval.prop('disabled', true);

        subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState());
    });

    $('.subpro-options.cart #delivery-interval').on('change', () => subscriptionOptions.ajaxUpdateOptions(subscriptionOptions.getOptionsState()));
}

exports.init = function () {
    initializeEvents();
    if (SitePreferences.STORE_PICKUP) {
        cartStoreInventory.init();
    }
    account.initCartLogin();
};