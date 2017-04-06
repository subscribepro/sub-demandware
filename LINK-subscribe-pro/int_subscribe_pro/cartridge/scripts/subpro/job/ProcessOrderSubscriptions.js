'use strict';

const OrderMgr = require('dw/order/OrderMgr');
const CustomerMgr = require('dw/customer/CustomerMgr');
const Logger = require('dw/system/Logger');
const Resource = require('dw/web/Resource');

const app = require('/app_storefront_controllers/cartridge/scripts/app');

const Email = require('/app_storefront_controllers/cartridge/scripts/models/EmailModel');
const SubscribeProLib = require('~/cartridge/scripts/subpro/lib/SubscribeProLib');
const AddressHelper = require('/int_subscribe_pro/cartridge/scripts/subpro/helpers/AddressHelper');
const CustomerHelper = require('/int_subscribe_pro/cartridge/scripts/subpro/helpers/CustomerHelper');
const PaymentsHelper = require('/int_subscribe_pro/cartridge/scripts/subpro/helpers/PaymentsHelper');
const CurrentSite = require('dw/system/Site').getCurrent();

let errors = [],
    currentOrderNo;

/**
 * Job entry point.
 */
function start() {
    let targetStartDateTime = new Date(Date.now() - parseInt(arguments[0].get('ordersProcessInterval')) * 3.6e+6),
        ordersToProcess = OrderMgr.searchOrders('creationDate >= {0} AND custom.subproSubscriptionsToBeProcessed = true', 'creationDate desc', targetStartDateTime);
   
    while (ordersToProcess.hasNext()) {
    	let order = ordersToProcess.next();
    	
    	if (!order.customer.registered) {
            logError("Order Customer is not registered, skipping this order", 'getCustomer');
            continue;
    	}
        
        var customer = CustomerMgr.getCustomerByLogin(order.customer.profile.credentials.login),
            customerProfile = customer.profile,
            paymentInstrument = order.paymentInstrument,
            customerPaymentInstrument = PaymentsHelper.getCustomerPaymentInstrument(customerProfile.wallet.paymentInstruments, paymentInstrument),
            shipments = order.shipments,
            allPLIsProcessed = true;


        currentOrderNo = order.orderNo;

        /**
         * Test customer
         */
        var customerSubproID = customerProfile.custom.subproCustomerID;
        if (customerSubproID) {
            // Customer is already a Subscribe Pro Customer.
            // Call service to verify that they are still a customer
            let response = SubscribeProLib.getCustomer(customerSubproID);

            if (response.error && response.result.code === 404) {
                // Customer not found. Create new customer record
                customerSubproID = createSubproCustomer(customer);
            } else if (response.error) {
                // Some other error occurred
                logError(response, 'getCustomer');

                continue;
            }
        } else {
            // Call service to create customer record
            customerSubproID = createSubproCustomer(customer);
        }

        if (!customerSubproID) {
            logError('Could not get customer Subscribe Pro ID. Skipping this order.');

            continue;
        }

        /**
         * Test Payment method
         */
        let paymentProfileID = false;
        
        if (paymentInstrument.getPaymentMethod() === "DW_APPLE_PAY") {
            let transactionID = paymentInstrument.getPaymentTransaction().getTransactionID();
            let response = SubscribeProLib.getPaymentProfile(null, transactionID);
            
            if (response.error) {
                // Some other error occurred
                logError(response, 'getPaymentProfile');

                continue;
            } else {
            	paymentProfileID = response.result.payment_profiles.pop().id;
            }
        } else {
	        paymentProfileID = ('subproPaymentProfileID' in paymentInstrument.custom) ? paymentInstrument.custom.subproPaymentProfileID : false;
	        if (paymentProfileID) {
	            // Payment Profile already exists.
	            // Call service to verify that it still exists at Subscribe Pro
	            let response = SubscribeProLib.getPaymentProfile(paymentProfileID);
	            if (response.error && response.result.code === 404) {
	                // Payment Profile not found. Create new Payment Profile record
	                paymentProfileID = createSubproPaymentProfile(customerProfile, customerPaymentInstrument, order.billingAddress);
	            } else if (response.error) {
	                // Some other error occurred
	                logError(response, 'getPaymentProfile');
	
	                continue;
	            }
	        } else {
	            // Call service to create Payment Profile record
	            paymentProfileID = createSubproPaymentProfile(customerProfile, customerPaymentInstrument, order.billingAddress);
	        }
        }
        
        if (!paymentProfileID) {
            logError('Could not get Subscribe Pro Payment profile ID. Skipping this order.');

            continue;
        }        
        
        /**
         * Iterate over shipments and Product Line Items
         */
        for (let i = 0, sl = shipments.length; i < sl; i++) {
            let shipment = shipments[i],
                plis = shipment.productLineItems;

            for (let j = 0, pl = plis.length; j < pl; j++) {
                let pli = plis[j];

                if (pli.custom.subproSubscriptionOptionMode) {
                    /**
                     * Test shipping addresses
                     */
                    let shippingAddress = AddressHelper.getCustomerAddress(customer.addressBook, shipment.shippingAddress);
                    if (!shippingAddress) {
                    	shippingAddress = app.getModel('Profile').get(order.customer.profile).addAddressToAddressBook(shipment.shippingAddress);
                    }

                    let subproAddress = AddressHelper.getSubproAddress(shippingAddress, customerProfile),
                        shippingResponse = SubscribeProLib.findCreateAddress(subproAddress),
                        subproShippingAddressID;

                    if (!shippingResponse.error) {
                        subproShippingAddressID = shippingResponse.result.address.id;
                        AddressHelper.setSubproAddressID(shippingAddress, subproShippingAddressID);
                    } else {
                        // Address was not created
                        logError(shippingResponse, 'findCreateAddress');

                        continue;
                    }

                    /**
                     * Process Product LineItem
                     */
                    let interval = pli.custom.subproSubscriptionInterval,
                        orderCreationDate = Date.parse(order.creationDate),
                        nextOrderDate;

                    switch (interval) {
                        case 'Every 2 Months':
                            nextOrderDate = new Date(orderCreationDate + 5.256e+9);
                            break;

                        case 'Monthly' || 'Month':
                            nextOrderDate = new Date(orderCreationDate + 2.628e+9);
                            break;

                        case 'Weekly':
                            nextOrderDate = new Date(orderCreationDate + 6.048e+8);
                            break
                        default: //@todo this needs removed
                        	nextOrderDate = new Date(orderCreationDate + 6.048e+8);
                        	break;
                    }

                    let subscription = {
                        'customer_id': customerSubproID,
                        'payment_profile_id': paymentProfileID,
                        'requires_shipping': true,
                        'shipping_address_id': subproShippingAddressID,
                        'product_sku': pli.productID,
                        'qty': pli.quantityValue,
                        'use_fixed_price': false,
                        'interval': pli.custom.subproSubscriptionInterval,
                        'next_order_date': nextOrderDate,
                        'send_customer_notification_email': true
                    };

                    let pliResponse = SubscribeProLib.postSubscription(subscription);

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

        if (allPLIsProcessed) {
            order.custom.subproSubscriptionsToBeProcessed = false;
        }
    }

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


/**
 * Log error and add it to errors array so it will be send via emeil.
 *
 * @param {object | string} response Service response or just error message string
 * @param {string} [serviceName] serviceName
 */
function logError(response, serviceName) {
    let msg = serviceName
        ? 'Error while calling service ' + serviceName + ".\nResponse: " + JSON.stringify(response)
        : response;

    Logger.error(msg);

    errors.push({
        'orderNo': currentOrderNo,
        'description': msg
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
    let response = SubscribeProLib.createCustomer(CustomerHelper.getSubproCustomer(customer));

    if (!response.error) {
        // Customer creates successfully. Save Subscribe Pro Customer ID to the Commerce Cloud Customer Profile
        CustomerHelper.setSubproCustomerID(customer.profile, response.result.customer.id);

        return response.result.customer.id;
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
    let response = SubscribeProLib.createPaymentProfile(PaymentsHelper.getSubscriptionPaymentProfile(customerProfile, paymentInstrument, billingAddress));

    if (!response.error) {
        // Payment profile creates successfully. Save Subscribe Pro Payment Profile ID to the Commerce Cloud Order Payment Instrument
        PaymentsHelper.setSubproPaymentProfileID(paymentInstrument, response.result.payment_profile.id);

        return response.result.payment_profile.id;
    }
}

module.exports.Start = start;