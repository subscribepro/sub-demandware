'use strict';

exports.config = {
    user: 'dw-sitegenesis',
    key: process.env.SAUCELABS_KEY,
    host: 'ondemand.saucelabs.com',
    port: '80',
    framework: 'mocha',
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000,
        compilers: ['js:babel-core/register']
    },
    specs: ['test/application/**'],
    capabilities: [{
        browserName: 'chrome',
        version: '47.0',
        platform: 'Linux'
    }],
    waitforTimeout: 60000,
    baseUrl: 'https://dev05-lab03b-dw.demandware.net/s/SiteGenesis',
    reporter: 'spec',
    locale: 'x_default'
};
