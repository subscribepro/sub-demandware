'use strict';

module.exports = {
    getContent: function (cid) {
        // mock a usecase when the content asset is not found
        if (cid === 'notfound') {return null;}
        return {
            custom: {
                body: cid
            }
        };
    }
};
