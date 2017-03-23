The payment extension point allows to define an implementation for a given payment provider.

The Demandware platform allows you to configure a _payment provider_ per _payment method_. SiteGenesis does now define an API a payment integration needs to comply which allows for **plug & play** integration. Only the following steps have to be performed such intgrations:

1. Get the payment cartridge
2. Add it to your workspace/deployment
3. Add it to the site's cartridge path

That's it!

### The Payment Integration API

Previously in SiteGenesis pipelines were used which followed a naming convention, this approach has been largely reused which means that a payment processor is represented by a module which exports methods as shown below.

```
/**
 * Handles the creation of a payment instrument for the given payment method and processor
 *
 * @param {Object} args                   The arguments passed to the extension point
 * @param {dw.order.Basket} args.Basket   The current basket
 * @param {string} args.PaymentMethodId   The ID of the payment method to handle
 */
exports.Handle = function(args){
    var basket    = args.Basket;
    var method    = args.PaymentMethod;
    var processor = args.PaymentProcessor;
    switch(method){
        case 'CREDIT_CARD':
            // ...
        case 'PAYPAL':
            // ...
        case default:
            return {
                status: 'NOT_SUPPORTED'
            };           
    }
};
 
/**
 * Handles the authorisation of a payment instrument of the given order
 *
 * @param {Object} args                                              The arguments passed to the extension point
 * @param {dw.order.Order} args.Order                                The order to authorize
 * @param {dw.order.OrderPaymentInstrument} args.PaymentInstrument   The payment instrument to authorise (i.e. a credit card)
 */
exports.Authorize = function(args){
    // ...
};
```

To allow full plug-ability of payment integration the _Demandware hook concept_ is used. This enables cartridges to define certain hooks which can then be executed using the hook manager. A payment integration is then basically a cartridge which defines the _payment processor module_ and registers it properly. If the given processor is selected for a payment method it will automatically find the registered hook and use it for payment processing.
The following hook would have to be defined for a CYBERSPACE payment processor (note the ID of the processor in the name of the hook app.payment.processor.<Payment Processor ID>).

```
{
    "hooks": [
        {
            "name": "app.payment.processor.CYBERSPACE",
            "script": "./payment/CyberspaceProcessor.ds"
        }
    ]
}
```

SiteGenesis will check if a hook has been registered for the configured processor and if not it falls back to a default processor.