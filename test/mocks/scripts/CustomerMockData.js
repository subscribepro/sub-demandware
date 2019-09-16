var CustomerMockData = {
    sfccCustomer: {
        profile: {
            firstName: 'Mock',
            lastName: 'Data',
            email: '<email>',
            customerNo: 1,
            custom: {
                subproCustomerID: 12345
            }
        },
        getProfile: function () {
            return CustomerMockData.sfccCustomer.profile;
        }
    },
    spCustomer: {
        email: '<email>',
        platform_specific_customer_id: 1,
        first_name: 'Mock',
        last_name: 'Data'
    },
    spCustomerWithId: {
        id: 12345,
        email: '<email>',
        platform_specific_customer_id: 1,
        first_name: 'Mock',
        last_name: 'Data'
    }
};

module.exports = CustomerMockData;
