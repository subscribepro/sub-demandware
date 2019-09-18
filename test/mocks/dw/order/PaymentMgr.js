var PaymentMgr = {
    getPaymentCard: function () {
        return {
            custom: {
                subproCardType: 'visa'
            }
        };
    }
};

module.exports = PaymentMgr;
