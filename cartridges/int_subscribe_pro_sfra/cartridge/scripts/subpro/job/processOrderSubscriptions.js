'use strict';

/**
 * Process Order Subscriptions
 * This script should be executed as part of Job Schedule and will accomplish the following:
 * - Find any orders that have subscriptions to be processes that were created on the specified time interval
 * - Loop across each of the orders and
 *  - Validate or create the Subscribe Pro Customer
 *  - Validate or create the Subscribe Pro Payment Profile
 *  - Validate or create the Subscribe Pro Address
 *  - Create the Product Subscription
 *
 * If any of the API requests ultimately error out, those errors will be added to a list and then
 * the final results / errors will be emailed to the email specified by the Site Preference
 */

/**
 * Required Modules
 */
var OrderMgr = require('dw/order/OrderMgr');
var CustomerMgr = require('dw/customer/CustomerMgr');
var Logger = require('dw/system/Logger');
var Resource = require('dw/web/Resource');

/**
 * Current Site, used to reference site preferences
 */
var CurrentSite = require('dw/system/Site').getCurrent();

/**
 * Main Subscribe Pro Library,
 * This library has various methods to help facilitate API requests
 */
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

/**
 * Subscribe Pro Object Helpers, used to help map Commerce Cloud Modules to Subscribe Pro Modules
 */
var AddressHelper = require('~/cartridge/scripts/subpro/helpers/addressHelper');
var CustomerHelper = require('~/cartridge/scripts/subpro/helpers/customerHelper');
var PaymentsHelper = require('~/cartridge/scripts/subpro/helpers/paymentsHelper');

/**
 * List of Errors
 * This will be used to collect the errors across orders
 */
var errors = [];

/**
 * Current Order Number
 * This will be used to help clarify the error logs
 */
var currentOrderNo;

/**
 * Log error and add it to errors array so it will be send via emeil.
 *
 * @param {Object | string} response Service response or just error message string
 * @param {string} [serviceName] serviceName
 */
function logError(response, serviceName) {
    var msg = serviceName
        ? 'Error while calling service ' + serviceName + '.\nResponse: ' + JSON.stringify(response)
        : response;

    Logger.error(msg);

    errors.push({
        orderNo: currentOrderNo,
        description: msg
    });
}

/**
 * Job entry point
 * This is the main processing method of this Script and will be executed by the Job Schedule
 */
function start() {
    /**
     * Target Start Time - Use the interval preference, in hours,
     * to calculate what the start time for the search should be
     */
    var targetStartDateTime = new Date(Date.now() - parseInt(arguments[0].get('ordersProcessInterval'), 10) * 3.6e+6);

    /**
     * Retreive a list of orders to be processed
     */
    var ordersToProcess = OrderMgr.searchOrders('status != {0} AND creationDate >= {1} AND custom.subproSubscriptionsToBeProcessed = true', 'creationDate desc',
        require('dw/order/Order').ORDER_STATUS_FAILED, targetStartDateTime);

    /**
     * Iterate across the orders
     */
    while (ordersToProcess.hasNext()) {
        var order = ordersToProcess.next();

        try {
            /**
             * Checkouts that contain subscriptions must be submitted by a registered user
             * This will check to ensure that's the case for this order
             */
            if (!order.customer.registered) {
                logError('Order Customer is not registered, skipping this order', 'getCustomer');
                continue; // eslint-disable-line no-continue
            }

            var customer = CustomerMgr.getCustomerByLogin(order.customer.profile.credentials.login);
            var customerProfile = customer.profile;

            var allPLIsProcessed = true;

            /**
             * Set this for the error log function to reference
             */
            currentOrderNo = order.orderNo;

            /**
             * Validate / Create the customer
             * If the customer already has a reference to a Subscribe Pro customer
             * Validate that the customer does in fact exist and if it doesn't or a
             * customer hasn't been created yet, create one
             * Else call service to create customer record
             */
            var customerSubproID = CustomerHelper.findOrCreateCustomer(customer);

            /**
             * If the above code block didn't return a Subscribe Pro Customer, error out
             */
            if (customerSubproID === null) {
                logError('Could not get customer Subscribe Pro ID. Skipping this order.');
                continue; // eslint-disable-line no-continue
            }

            /**
             * Validate / Create the payment profile
             * If the payment instrument already has a reference to a Subscribe Pro payment profile
             * Validate that the payment profile does in fact exist and if it doesn't or a
             * payment profile hasn't been created yet, create one
             */
            var paymentProfileID = PaymentsHelper.findOrCreatePaymentProfile(
                order.paymentInstrument,
                PaymentsHelper.getCustomerPaymentInstrument(
                    customerProfile.wallet.paymentInstruments.toArray(),
                    order.paymentInstrument
                ),
                customer.profile,
                order.billingAddress
            );

            /**
             * If the above code block didn't return a Subscribe Pro Payment Profile, error out
             */
            if (!paymentProfileID) {
                logError('Could not get Subscribe Pro Payment profile ID. Skipping this order.');
                continue; // eslint-disable-line no-continue
            }

            var shipments = order.shipments;
            /**
             * Iterate over shipments and Product Line Items
             */
            for (var i = 0, sl = shipments.length; i < sl; i++) {
                var shipment = shipments[i];
                var plis = shipment.productLineItems;

                for (var j = 0, pl = plis.length; j < pl; j++) {
                    var pli = plis[j];

                    if (pli.custom.subproSubscriptionSelectedOptionMode && !pli.custom.subproSubscriptionCreated) {
                        /**
                         * Validate / Create shipping addresses using the customers saved address and
                         * the Find / Create Subscribe Pro API
                         */
                        var customerAddressBook = customer.addressBook;
                        var shippingAddress = AddressHelper.getCustomerAddress(customerAddressBook.getAddresses().toArray(), shipment.shippingAddress);

                        if (!shippingAddress) {
                            var profile = order.customer.getProfile();
                            var addressBook = profile.getAddressBook();

                            shippingAddress = addressBook.createAddress(shipment.shippingAddress.getAddress1());
                            shippingAddress.setAddress1(shipment.shippingAddress.getAddress1());
                            shippingAddress.setAddress2(shipment.shippingAddress.getAddress2());
                            shippingAddress.setCity(shipment.shippingAddress.getCity());
                            shippingAddress.setCountryCode(shipment.shippingAddress.getCountryCode());
                            shippingAddress.setFirstName(shipment.shippingAddress.getFirstName());
                            shippingAddress.setLastName(shipment.shippingAddress.getLastName());
                            shippingAddress.setPhone(shipment.shippingAddress.getPhone());
                            shippingAddress.setPostalCode(shipment.shippingAddress.getPostalCode());
                            shippingAddress.setStateCode(shipment.shippingAddress.getStateCode());
                        }

                        var subproAddress = AddressHelper.getSubproAddress(shippingAddress, customerProfile, false, false);
                        var shippingResponse = SubscribeProLib.findCreateAddress(subproAddress);
                        var subproShippingAddressID;

                        /**
                         * If there wasn't an error, save the Subscribe Pro Address ID
                         * Otherwise, error out
                         */
                        if (!shippingResponse.error) {
                            subproShippingAddressID = shippingResponse.result.address.id;
                            AddressHelper.setSubproAddressID(shippingAddress, subproShippingAddressID);
                        } else {
                            logError(shippingResponse, 'findCreateAddress');
                            continue; // eslint-disable-line no-continue
                        }

                        /**
                         * Process Product LineItem and create the subscription,
                         * if we made it this far in the code we will need:
                         * - customerSubproID
                         * - paymentProfileID
                         * - subproShippingAddressID
                         */
                        var orderCreationDate = order.getCreationDate();

                        var subscription = {
                            customer_id: customerSubproID,
                            payment_profile_id: paymentProfileID,
                            requires_shipping: true,
                            shipping_address_id: subproShippingAddressID,
                            shipping_method_code: shipment.shippingMethodID,
                            product_sku: pli.productID,
                            qty: pli.quantityValue,
                            use_fixed_price: false,
                            next_order_date: dw.util.StringUtils.formatCalendar(new dw.util.Calendar(orderCreationDate), 'yyy-MM-dd'),
                            first_order_already_created: true,
                            send_customer_notification_email: true,
                            platform_specific_fields: {
                                sfcc: {
                                    product_options: []
                                }
                            }
                        };

                        var response = SubscribeProLib.getProduct(pli.productID);
                        if (response.error || !response.result.products.length) {
                            return;
                        }
                        var spproduct = response.result.products.pop();
                        var schedulingHelper = require('/int_subscribe_pro_sfra/cartridge/scripts/subpro/helpers/schedulingHelper.js');
                        var scheduleType = schedulingHelper.getProductScheduleType(spproduct);
                        if (scheduleType != 'interval') {
                            subscription.scheduling_rule_params = schedulingHelper.getScheduleParamsFromPli(pli, scheduleType);
                        } else {
                            subscription.interval = pli.custom.subproSubscriptionInterval;
                        }

                        var productOptions = pli.optionProductLineItems;

                        if (productOptions.length > 0) {
                            for (var poInc in productOptions) {
                                var productOption = productOptions[poInc];
                                subscription.platform_specific_fields.sfcc.product_options.push({
                                    id: productOption.optionID,
                                    value: productOption.optionValueID
                                });
                            }
                        } else {
                            delete subscription.platform_specific_fields.sfcc.product_options;
                        }

                        var pliResponse = SubscribeProLib.postSubscription(subscription);

                        /**
                         * If there were no problems, save the attributes
                         * Otherwise, error out
                         */
                        if (!pliResponse.error) {
                            pli.custom.subproSubscriptionCreated = true;
                            pli.custom.subproSubscriptionDateCreated = new Date(pliResponse.result.subscription.created);
                            pli.custom.subproSubscriptionID = pliResponse.result.subscription.id;
                        } else {
                            allPLIsProcessed = false;

                            logError(pliResponse, 'postSubscription');
                        }
                    }
                }
            }

            /**
             * If all product line items were processed, update the order
             */
            if (allPLIsProcessed) {
                order.custom.subproSubscriptionsToBeProcessed = false;
            }
        } catch (e) {
            logError('Error processing order: ' + e);
            continue; // eslint-disable-line no-continue
        }
    }

    /**
     * If there were any errors, send an email to the preference email
     */
    if (errors.length) {
        var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
        hooksHelper('app.customer.email', 'sendEmail', [{
            to: CurrentSite.getCustomPreferenceValue('subproOrderProcessingErrorMail'),
            from: CurrentSite.getCustomPreferenceValue('subproOrderProcessingErrorMail'),
            subject: Resource.msg('order.processing.failureemail.subject', 'order', null)
        }, 'subpro/mail/orderprocessingerror', {
            Errors: errors
        }], function (object, template, context) {
            var Mail = require('dw/net/Mail');
            var mail = new Mail();
            mail.addTo(object.to);
            mail.setSubject(object.subject);
            mail.setFrom(object.from);
            mail.setContent(require('*/cartridge/scripts/renderTemplateHelper').getRenderedHtml(context, template), 'text/html', 'UTF-8');
            mail.send();
        });
    }
}

module.exports.Start = start;
