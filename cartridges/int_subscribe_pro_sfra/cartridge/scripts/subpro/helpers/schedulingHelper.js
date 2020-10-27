'use strict';

var Transaction = require('dw/system/Transaction');
var Logger = require('dw/system/Logger');
var SubscribeProLib = require('~/cartridge/scripts/subpro/lib/subscribeProLib');

var schedulingHelper = {

    /**
     *
     * @param {array} productData Product data from SP API
     * @return {mixed} False if not using a scheduling rule, otherwise,
     */
    getProductScheduleType: function (productData) {
        if (typeof productData.use_scheduling_rule !== 'undefined' && productData.use_scheduling_rule) {
            var schedulingRuleData = productData.scheduling_rule;
            switch (schedulingRuleData.type) {
                // List our supported scheduling rule types
                case 'every_n_periods':
                    return schedulingRuleData.type;
                default:
                    // Fall back to interval-based scheduling if the 'type' isn't recognized here
                    Logger.info('No recognized advanced rule type set, though use_scheduling_rule is enabled. Falling back to interval-based scheduling.');
            }
        }
        return 'interval';
    },

    getProductScheduleData: function (productData) {
        if (typeof productData.use_scheduling_rule !== 'undefined' && productData.use_scheduling_rule) {
            var data = JSON.parse(productData.scheduling_rule.data);
            return data[schedulingHelper.getProductScheduleType(productData)];
        }
        return {};
    },

    getScheduleParamsFromPli: function (pli, type) {
        params = {};
        switch (type) {
            case 'every_n_periods':
                params.num_periods = pli.custom.subproSubscriptionNumPeriods;
                break;
            default:
                break;
        }

        return params;
    },

    getAvailableScheduleData: function (productData, selectedInterval) {
        var productSchedule = {
            type: schedulingHelper.getProductScheduleType(productData)
        };

        if (productSchedule.type == 'interval') {
            productSchedule.selectedInterval = selectedInterval || productData.default_interval;
            productSchedule.intervals = productData.intervals.toString().split(',');
        } else if (productSchedule.type == 'every_n_periods') {
            productScheduleData = schedulingHelper.getProductScheduleData(productData);
            productSchedule.period = productScheduleData.period;
        }

        return productSchedule;
    }

};

module.exports = schedulingHelper;
