'use strict';

/* eslint no-undef: 0 */

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('base/product/detail'));
    processInclude(require('./subscriptionOptions'));
});
