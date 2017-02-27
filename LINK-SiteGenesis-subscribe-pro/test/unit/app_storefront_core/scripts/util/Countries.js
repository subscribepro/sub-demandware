'use strict';

import {assert} from 'chai';
import Locale from '../../../../mocks/dw/util/Locale';
import proxyquireModule from 'proxyquire';
import sinon from 'sinon';

let countryCode = 'ab_CD';
let country = {countryCode: countryCode};
let proxyquire = proxyquireModule.noCallThru();

let Countries = proxyquire('../../../../../app_storefront_core/cartridge/scripts/util/Countries.ds', {
    '~/cartridge/countries': [country],
    'dw/util/Locale': Locale
});

describe('Countries Script', () => {

    describe('.getCurrent()', () => {

        it('should return a country given a locale', () => {
            let result = Countries.getCurrent({
                CurrentRequest: {
                    locale: countryCode
                }
            });

            assert.equal(result, country);
        });

        it('should return the first country if locale has no country', () => {
            let stubGetLocale = sinon.stub(Locale, 'getLocale', () => { return {}; });
            let result = Countries.getCurrent({
                CurrentRequest: {locale: countryCode}
            });

            assert.equal(result, country);

            stubGetLocale.restore();
        });
    });
});
