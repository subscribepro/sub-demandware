var AddressMockData = {
    spAddress: {
        address_id: 1116883,
        customer_id: 761431,
        first_name: 'Mocked',
        middle_name: '',
        last_name: 'Data',
        company: 'SubscribePro',
        street1: 'Street',
        street2: '',
        city: 'City',
        region: 'ST',
        postcode: '22222',
        country: 'UNITED STATES',
        phone: '1234567890'
    },
    sfccProfile: {
        firstName: 'Mocked',
        lastName: 'Data',
        custom: {
            subproCustomerID: 761431
        }
    },
    sfccAddress: {
        first_name: 'Mocked',
        last_name: 'Data',
        address1: 'Street',
        address2: '',
        city: 'City',
        stateCode: 'ST',
        companyName: 'SubscribePro',
        postalCode: '22222',
        phone: '1234567890',
        countryCode: {
            toString: function () {
                return 'United States';
            }
        },
        custom: {
            subproAddressID: 1116883
        }
    },
    addressBook: {
        addresses: [
            {
                first_name: 'Mocked',
                last_name: 'Data',
                address1: 'Street',
                address2: '',
                city: 'City',
                stateCode: 'ST',
                companyName: 'SubscribePro',
                postalCode: '22222',
                phone: '1234567890',
                countryCode: {
                    toString: function () {
                        return 'United States';
                    }
                },
                custom: {
                    subproAddressID: 1116883
                }
            }
        ]
    }
};


module.exports = AddressMockData;
