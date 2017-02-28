'use strict';

let util = require('../../../../link-sitegenesis-subscribepro/app_storefront_core/cartridge/js/util.js');

/**
 * Subscription Options Module
 * 
 * This frontend Javascript module adds listeners to the relevant DOM elements and 
 * creates the code to handle storefront interactions by end users. 
 */

let subscriptionOptions = {
	/**
	 * Cart Initialization 
	 * - Add event listeners to the Subscription Option Mode and Delivery Interval in the cart
	 * - When a user selects a different option, update selected options, via ajax, and update the "edit" link
	 * - Show / Hide Intervals dropdown depending on the type of subscription 
	 */
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

	/**
	 * Variant Initialization 
	 * - Add event listeners to the Subscription Option Mode and Delivery Interval on the Product Page
	 * - When a user selects a different option, update selected options, via ajax
	 * - Show / Hide Intervals dropdown depending on the type of subscription 
	 */
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

	/**
	 * Get Options State
	 * Get the currently selected subscription options as a JSON object
	 */
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

	/**
	 * Update the selected subscription options with the provided JSON object
	 */
	ajaxUpdateOptions: (data) => {
		$.ajax({
			type: 'POST',
			cache: false,
			contentType: 'application/json',
			url: util.appendParamToURL(Urls.subproSubscriptionOptions, 'options', JSON.stringify(data))
		});
	},

	/**
	 * Rebuild the provided URL with the provided key / value pair ammended 
	 */
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

	/**
	 * Toggle the Delivery Interval options
	 * These options should only be visible for "regular" subscriptions
	 */
	toggleDeliveryIntervalDropdown: (event, $deliveryInterval) => {
		$(event.currentTarget).val() === 'regular'
			? $deliveryInterval.attr('hidden', false)
			: $deliveryInterval.attr('hidden', true);
	}
};

module.exports = subscriptionOptions;
