var PaymentProfileMockData = {
    payment_profile: {
        customer_id: '761431',
        payment_token: 'ABCD-UNIQUE-PAY-TOKEN',
        creditcard_type: 'visa',
        creditcard_first_digits: '41111',
        creditcard_last_digits: '1111',
        creditcard_month: '3',
        creditcard_year: '2025',
        vault_specific_fields: {
            sfcc: {
                payment_instrument_id: '12341234123',
                my_other_field: 'stuff'
            }
        },
        billing_address: {
            first_name: 'Bob',
            middle_name: 'A',
            last_name: 'Jones',
            company: 'Bobs Emporium',
            street1: '123 Here St',
            street2: 'Apt B',
            city: 'Baltimore',
            region: 'MD',
            postcode: '21212',
            country: 'US',
            phone: '410-123-4567'
        }
    }
};

module.exports = PaymentProfileMockData;
