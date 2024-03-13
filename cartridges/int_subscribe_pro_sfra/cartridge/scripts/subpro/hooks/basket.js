'use strict';

var Status = require('dw/system/Status');

/**
 * afterPost
 * @param {dw.order.Basket} basket - basket
 * @returns {Status} a non-null Status ends the hook execution
 */
function afterPost(basket) {
    if (basket.custom.subproIsRecurringOrder) {
        basket.custom.subproContainsSubscriptions = true;
    }

    return new Status(Status.OK);
}

module.exports = {
    afterPost: afterPost
};
