"use strict";

var processInclude = require("base/util");

$(document).ready(function () {
    processInclude(require("./subscriptionOptions"));
    processInclude(require("base/cart/cart"));
});
