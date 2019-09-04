'use strict';

/* eslint no-undef: 0 */

module.exports = {
    afterRemovePayment: function () {
        $(document).on('payment:remove', function (e) {
            e.preventDefault();
            window.location.reload();
        });
    }
};
