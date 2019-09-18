var OrderPaymentInstrument = {
    UUID: 123456,
    creditCardNumberLastDigits: '1111',
    paymentMethod: 'CREDIT_CARD',
    creditCardNumber: '4111111111111111',
    creditCardHolder: 'Mock Data',
    creditCardExpirationYear: '2026',
    creditCardExpirationMonth: '05',
    custom: {
        subproPaymentProfileID: 54321
    },
    getCreditCardHolder: function () {
        return 'Mock Data';
    }
};

module.exports = OrderPaymentInstrument;
