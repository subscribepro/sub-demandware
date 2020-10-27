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
 * Site Genesis App Module, used to reference various Commerce Cloud objects like Profile Model
 */
var app = require('/app_storefront_controllers/cartridge/scripts/app');

/**
 * Site Genesis Email Module, used to email the error logs
 */
var Email = require('/app_storefront_controllers/cartridge/scripts/models/EmailModel');

/**
 * Main Subscribe Pro Library,
 * This library has various methods to help facilitate API requests
 */
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/SubscribeProLib');

/**
 * Subscribe Pro Object Helpers, used to help map Commerce Cloud Modules to Subscribe Pro Modules
 */
var AddressHelper = require('/int_subscribe_pro_sg/cartridge/scripts/subpro/helpers/AddressHelper');
var CustomerHelper = require('/int_subscribe_pro_sg/cartridge/scripts/subpro/helpers/CustomerHelper');
var PaymentsHelper = require('/int_subscribe_pro_sg/cartridge/scripts/subpro/helpers/PaymentsHelper');

/**
 * Current Site, used to reference site preferences
 */
var CurrentSite = require('dw/system/Site').getCurrent();

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
 * Call service to create customer.
 *
 * @param {dw.customer.Customer} customer Sales Force Commerce Cloud Customer Object
 *
 * @returns {number|undefined} id unique identifier of created customer or undefined
 */
function createSubproCustomer(customer) {
    var customerToPost = CustomerHelper.getSubproCustomer(customer);
    var response = SubscribeProLib.createCustomer(customerToPost);

    if (!response.error) {
        // Customer creates successfully. Save Subscribe Pro Customer ID to the Commerce Cloud Customer Profile
        var customerID = response.result.customer.id;
        CustomerHelper.setSubproCustomerID(customer.profile, customerID);

        return customerID;
    } if (response.error && response.result.code === 409) {
        // Customer's email address already exists, get customer by email
        var getCustomerResponse = SubscribeProLib.getCustomer(null, customerToPost.email);
        if (!getCustomerResponse.error) {
            var foundCustomerID = getCustomerResponse.result.customers.pop().id;
            CustomerHelper.setSubproCustomerID(customer.profile, foundCustomerID);

            return foundCustomerID;
        }
    }
}


/**
 * Call service to create payment profile.
 *
 * @param {dw.customer.Profile} customerProfile Sales Force Commerce Cloud Customer profile Object
 * @param {dw.customer.CustomerPaymentInstrument} paymentInstrument payment instrument used to pay order
 * @param {dw.order.OrderAddress} billingAddress the Address class represents a customer's address
 *
 * @returns {number|undefined} id unique identifier of created payment profile or undefined
 */
function createSubproPaymentProfile(customerProfile, paymentInstrument, billingAddress) {
    var response = SubscribeProLib.createPaymentProfile(PaymentsHelper.getSubscriptionPaymentProfile(customerProfile, paymentInstrument, billingAddress));

    if (!response.error) {
        // Payment profile creates successfully. Save Subscribe Pro Payment Profile ID to the Commerce Cloud Order Payment Instrument
        var paymentProfileID = response.result.payment_profile.id;
        PaymentsHelper.setSubproPaymentProfileID(paymentInstrument, paymentProfileID);

        return paymentProfileID;
    }
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
    var targetStartDateTime = new Date(Date.now() - parseInt(arguments[0].get('ordersProcessInterval')) * 3.6e+6);

    /**
     * Retreive a list of orders to be processed
     */
    var ordersToProcess = OrderMgr.searchOrders('status != {0} AND creationDate >= {1} AND custom.subproSubscriptionsToBeProcessed = true', 'creationDate desc',
        dw.order.Order.ORDER_STATUS_FAILED, targetStartDateTime);

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

            /**
             * Define and initialize some attributes to be used within this loop
             */
            var customer = CustomerMgr.getCustomerByLogin(order.customer.profile.credentials.login);
            var customerProfile = customer.profile;
            var paymentInstrument = order.paymentInstrument;
            var customerPaymentInstrument = PaymentsHelper.getCustomerPaymentInstrument(customerProfile.wallet.paymentInstruments, paymentInstrument);
            var shipments = order.shipments;
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
            var customerSubproID = customerProfile.custom.subproCustomerID;

            /**
             * Customer is already a Subscribe Pro Customer
             * Call service to verify that they are still a customer
             */
            if (customerSubproID) {
                var getCustomerResponse = SubscribeProLib.getCustomer(customerSubproID);

                if (getCustomerResponse.error && getCustomerResponse.result.code === 404) {
                    // Customer not found. Create new customer record
                    customerSubproID = createSubproCustomer(customer);
                } else if (getCustomerResponse.error) {
                    // Some other error occurred
                    logError(getCustomerResponse, 'getCustomer');

                    continue; // eslint-disable-line no-continue
                }
            } else {
                customerSubproID = createSubproCustomer(customer);
            }

            /**
             * If the above code block didn't return a Subscribe Pro Customer, error out
             */
            if (!customerSubproID) {
                logError('Could not get customer Subscribe Pro ID. Skipping this order.');
                continue; // eslint-disable-line no-continue
            }

            /**
             * Validate / Create the payment profile
             * If the payment instrument already has a reference to a Subscribe Pro payment profile
             * Validate that the payment profile does in fact exist and if it doesn't or a
             * payment profile hasn't been created yet, create one
             */
            var paymentProfileID = false;

            /**
             * Apple Pay otherwise assume Credit Card
             */
            if (paymentInstrument.getPaymentMethod() === 'DW_APPLE_PAY') {
                var transactionID = paymentInstrument.getPaymentTransaction().getTransactionID();
                var getPaymentProfileResponse = SubscribeProLib.getPaymentProfile(null, transactionID);

                /**
                 * If there was a problem creating the payment profile, error out
                 */
                if (getPaymentProfileResponse.error) {
                    logError(getPaymentProfileResponse, 'getPaymentProfile');
                    continue; // eslint-disable-line no-continue
                } else {
                    paymentProfileID = getPaymentProfileResponse.result.payment_profiles.pop().id;
                }
            } else {
                paymentProfileID = (customerPaymentInstrument && ('subproPaymentProfileID' in customerPaymentInstrument.custom)) ? customerPaymentInstrument.custom.subproPaymentProfileID : false;

                /**
                 * If Payment Profile already exists,
                 * Call service to verify that it still exists at Subscribe Pro
                 */
                if (paymentProfileID) {
                    var response = SubscribeProLib.getPaymentProfile(paymentProfileID);

                    /**
                     * Payment Profile not found, create new Payment Profile record
                     * Otherwise create the payment profile
                     */
                    if (response.error && response.result.code === 404) {
                        paymentProfileID = createSubproPaymentProfile(customerProfile, customerPaymentInstrument, order.billingAddress);
                    /**
                     * Some other error occurred, error out
                     */
                    } else if (response.error) {
                        logError(response, 'getPaymentProfile');
                        continue; // eslint-disable-line no-continue
                    }
                } else {
                    paymentProfileID = createSubproPaymentProfile(customerProfile, customerPaymentInstrument, order.billingAddress);
                }
            }

            /**
             * If the above code block didn't return a Subscribe Pro Payment Profile, error out
             */
            if (!paymentProfileID) {
                logError('Could not get Subscribe Pro Payment profile ID. Skipping this order.');
                continue; // eslint-disable-line no-continue
            }

            /**
             * Iterate over shipments and Product Line Items
             */
            for (var i = 0, sl = shipments.length; i < sl; i++) {
                var shipment = shipments[i];
                var plis = shipment.productLineItems;

                for (var j = 0, pl = plis.length; j < pl; j++) {
                    var pli = plis[j];

                    if (pli.custom.subproSubscriptionOptionMode && !pli.custom.subproSubscriptionCreated) {
                        /**
                         * Validate / Create shipping addresses using the customers saved address and
                         * the Find / Create Subscribe Pro API
                         */
                        var shippingAddress = AddressHelper.getCustomerAddress(customer.addressBook, shipment.shippingAddress);

                        if (!shippingAddress) {
                            shippingAddress = app.getModel('Profile').get(order.customer.profile).addAddressToAddressBook(shipment.shippingAddress);
                        }

                        var subproAddress = AddressHelper.getSubproAddress(shippingAddress, customerProfile);
                        var shippingResponse = SubscribeProLib.findCreateAddress(subproAddress);
                        var subproShippingAddressID;

                        /**
                         * If there was any error, save the Subscribe Pro Address ID
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
                            interval: pli.custom.subproSubscriptionInterval,
                            next_order_date: dw.util.StringUtils.formatCalendar(new dw.util.Calendar(orderCreationDate), 'yyy-MM-dd'),
                            first_order_already_created: true,
                            send_customer_notification_email: true,
                            platform_specific_fields: {
                                sfcc: {
                                    product_options: []
                                }
                            }
                        };

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
        Email.sendMail({
            template: 'subpro/mail/orderprocessingerror',
            recipient: CurrentSite.getCustomPreferenceValue('subproOrderProcessingErrorMail'),
            subject: Resource.msg('order.processing.failureemail.subject', 'order', null),
            context: {
                Errors: errors
            }
        });
    }
}

module.exports.Start = start;
