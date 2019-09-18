var PaymentProfileMockData = {
    spPaymentProfile: {
        customer_id: 12345,
        payment_token: 123456,
        creditcard_type: 'visa',
        creditcard_last_digits: '1111',
        creditcard_month: '05',
        creditcard_year: '2026',
        vault_specific_fields: {
            sfcc: {
                payment_instrument_id: 123456
            }
        },
        payment_profile_id: 54321,
        billing_address: { first_name: 'Mock', last_name: 'Data' }
    },
    sfccPaymentInstrument: {
        paymentMethod: 'CREDIT_CARD',
        creditCardNumber: '4111111111111111',
        creditCardHolder: 'Mock Data',
        creditCardExpirationYear: '2026',
        creditCardExpirationMonth: '05',
        custom: {
            subproPaymentProfileID: 124365
        }
    },
    wallet: [
        {
            paymentMethod: 'CREDIT_CARD',
            creditCardNumber: '4111111111111111',
            creditCardHolder: 'Mock Data',
            creditCardExpirationYear: '2026',
            creditCardExpirationMonth: '05',
            custom: {
                subproPaymentProfileID: 124365
            }
        }
    ]
};

module.exports = PaymentProfileMockData;
