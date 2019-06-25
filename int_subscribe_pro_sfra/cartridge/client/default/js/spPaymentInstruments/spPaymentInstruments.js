'use strict';

var url;

module.exports = {
    afterRmovePayment: function () {
        $('.remove-payment').on('click', function (e) {
            e.preventDefault();
            window.location.reload();
        });
    }
};
