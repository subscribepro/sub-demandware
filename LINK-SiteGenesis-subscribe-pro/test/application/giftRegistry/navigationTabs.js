'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import * as giftRegistryPage from '../pageObjects/giftRegistry';
import * as testData from '../pageObjects/testData/main';
import * as customers from '../pageObjects/testData/customers';
import * as Resource from '../../mocks/dw/web/Resource';

let locale = config.locale;

describe('Gift Registry Navigation', () => {
    let userEmail = config.userEmail;
    let editedEventFormData = {};
    let editedEventFormShippingData = {};
    let editedEventFormShippingData2 = {};
    let eventFormData = {};
    let eventFormShippingData = {};
    let editedAfterEventFormShippingData = {};
    let editedAfterEventFormShippingData2 = {};
    let purchasesNoProductsFound = Resource.msg('registry.noproductsfound', 'account', null);
    let emails = ['testuser1@demandware.com', 'testuser2@demandware.com','testuser3@demandware.com'];
    let result = emails.filter(function(user) {
        return user !== userEmail;
    })
    let userEmail2 = result[0];
    let editedGiftRegistryTitle = {
        'x_default': 'LLAMA PALOOZA WORLD TOUR - 2/22/22',
        'en_GB': 'LLAMA PALOOZA WORLD TOUR - 22/02/2022'
    };

    before(() => testData.load()
        .then(() => {
            const customer = testData.getCustomerByLogin(userEmail);
            const customer2 = testData.getCustomerByLogin(userEmail2);
            const address = customer.getPreferredAddress();
            const address2 = customer2.getPreferredAddress();

            address.postalCode = customers.globalPostalCode[locale];
            address.countryCode = customers.globalCountryCode[locale];
            address.phone = customers.globalPhone[locale];

            address2.postalCode = customers.globalPostalCode[locale];
            address2.countryCode = customers.globalCountryCode[locale];
            address2.phone = customers.globalPhone[locale];

            editedEventFormData = {
                type: 'other',
                name: 'Llama Palooza World Tour',
                date: '02-22-2022',
                eventaddress_country: address2.countryCode,
                town: 'Far Far Away',
                participant_role: 'Other',
                participant_firstName: 'The Muffin',
                participant_lastName: 'Man',
                participant_email: customer2.email,
                coParticipant_role: 'Other',
                coParticipant_firstName: customer2.firstName,
                coParticipant_lastName: customer.lastName,
                coParticipant_email: userEmail2
            };

            eventFormData = {
                type: 'wedding',
                name: 'Wedding of the Century',
                date: '03/28/2008',
                eventaddress_country: address.countryCode,
                town: address.city,
                participant_role: 'Groom',
                participant_firstName: customer.firstName,
                participant_lastName: customer.lastName,
                participant_email: customer.email
            };

            editedEventFormShippingData = {
                addressid: 'Other Home',
                firstname: customer2.firstName,
                lastname: customer2.lastName,
                address1: address2.address1,
                city: address2.city,
                postal: address2.postalCode,
                country: address2.countryCode,
                phone: address2.phone
            };

            eventFormShippingData = {
                addressid: 'summerHome',
                firstname: customer.firstName,
                lastname: customer.lastName,
                address1: address.address1,
                city: address.city,
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };

            editedAfterEventFormShippingData = {
                addressid: 'After Event',
                firstname: customer2.firstName,
                lastname: customer2.lastName,
                address1: address2.address1,
                city: address2.city,
                postal: address2.postalCode,
                country: address2.countryCode,
                phone: address2.phone
            };

            editedEventFormShippingData2 = {
                addressid: 'Other Home',
                firstname: customer.firstName,
                lastname: customer.lastName,
                address1: address.address1,
                city: 'Rome',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };

            editedAfterEventFormShippingData2 = {
                addressid: 'After Event',
                firstname: customer.firstName,
                lastname: customer.lastName,
                address1: address.address1,
                city: 'Augusta',
                postal: address.postalCode,
                country: address.countryCode,
                phone: address.phone
            };

            if (locale && (locale === 'x_default' || locale === 'en_US')) {
                editedEventFormData.eventaddress_states_state = 'ME';
                eventFormData.eventaddress_states_state = address.stateCode;
                editedEventFormShippingData.states_state = address2.stateCode;
                eventFormShippingData.states_state = address.stateCode;
                editedAfterEventFormShippingData.states_state = 'ME';
                editedEventFormShippingData2.states_state = 'NH';
                editedAfterEventFormShippingData2.states_state = 'NH';
            }
        })
        .then(() => giftRegistryPage.createGiftRegistry(locale, eventFormData, eventFormShippingData))
    );

    after(() => {
        return giftRegistryPage.giftRegistryCleanUp()
    });

    it('Should go to the event info page in gift registry', () =>
        browser.click(giftRegistryPage.BTN_NAV_EVENT)
            .then(() => browser.isVisible(giftRegistryPage.BTN_EVENT_SET_PARTICIPANTS))
            .then(visible => assert.isTrue(visible))
    );

    it('Should edit the event info then check to see that event title and date changed', () =>
        giftRegistryPage.fillOutEventForm(editedEventFormData)
            .then(() => browser.click(giftRegistryPage.BTN_EVENT_SET_PARTICIPANTS))
            .then(() => browser.waitForVisible(giftRegistryPage.REGISTRY_HEADING))
            .then(() => browser.getText(giftRegistryPage.REGISTRY_HEADING))
            // check that the event name and date changed
            .then(eventTitle => assert.equal(eventTitle, editedGiftRegistryTitle[locale]))
    );

    it('Should check to see if values were edited in event info', () =>
        browser.click(giftRegistryPage.BTN_NAV_EVENT)
            .then(() => browser.waitForVisible(giftRegistryPage.BTN_EVENT_SET_PARTICIPANTS))
            // checks to see that event type changed
            .then(() => browser.getValue(giftRegistryPage.EVENT_TYPE))
            .then(eventTypeValue => assert.equal(eventTypeValue, editedEventFormData.type))
            // checks to see that event name changed
            .then(() => browser.getValue(giftRegistryPage.EVNET_NAME))
            .then(eventNameValue => assert.equal(eventNameValue, editedEventFormData.name))
            // checks to see that event town changed
            .then(() => browser.getValue(giftRegistryPage.EVENT_TOWN))
            .then(eventCityValue => assert.equal(eventCityValue, editedEventFormData.town))
            // checks to see that event participant role changed
            .then(() => browser.getValue(giftRegistryPage.PARTICIPANT_ROLE))
            .then(participantRoleValue => assert.equal(participantRoleValue, editedEventFormData.participant_role))
            // checks to see that event participant_firstName changed
            .then(() => browser.getValue(giftRegistryPage.PARTICIPANT_FIRST_NAME))
            .then(participantFirstNameValue => assert.equal(participantFirstNameValue, editedEventFormData.participant_firstName))
            // checks to see that event participant_lastName changed
            .then(() => browser.getValue(giftRegistryPage.PARTICIPANT_LAST_NAME))
            .then(participantLastNameValue => assert.equal(participantLastNameValue, editedEventFormData.participant_lastName))
            // checks to see that event participant_email changed
            .then(() => browser.getValue(giftRegistryPage.PARTICIPANT_EMAIL))
            .then(participantEmailValue => assert.equal(participantEmailValue, editedEventFormData.participant_email))
            // checks to see that event coparticipant role changed
            .then(() => browser.getValue(giftRegistryPage.COPARTICIPANT_ROLE))
            .then(coParticipantRoleValue => assert.equal(coParticipantRoleValue, editedEventFormData.coParticipant_role))
            // checks to see that event coparticipant_firstName changed
            .then(() => browser.getValue(giftRegistryPage.COPARTICIPANT_FIRST_NAME))
            .then(coParticipantFirstNameValue => assert.equal(coParticipantFirstNameValue, editedEventFormData.coParticipant_firstName))
            // checks to see that event coparticipant_lastName changed
            .then(() => browser.getValue(giftRegistryPage.COPARTICIPANT_LAST_NAME))
            .then(coParticipantLastNameValue => assert.equal(coParticipantLastNameValue, editedEventFormData.coParticipant_lastName))
            // checks to see that event coparticipant_email changed
            .then(() => browser.getValue(giftRegistryPage.COPARTICIPANT_EMAIL))
            .then(coPparticipantEmailValue => assert.equal(coPparticipantEmailValue, editedEventFormData.coParticipant_email))
    );

    if (locale && (locale === 'x_default' || locale === 'en_US')) {
        it('Should check to verify that the state value has changed', () =>
            browser.getValue(giftRegistryPage.EVENT_STATE)
                .then(eventStateValue => assert.equal(eventStateValue, editedEventFormData.eventaddress_states_state))
        );
    }

    it('Should go to the shipping info page in gift registry', () =>
        browser.click(giftRegistryPage.BTN_NAV_SHIPPING)
            .then(() => browser.isVisible(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
            .then(visible => assert.isTrue(visible))
    );

    it('Should edit the pre event shipping information', () =>
        giftRegistryPage.fillOutEventShippingForm(editedEventFormShippingData)
            .then(() => giftRegistryPage.fillOutAfterEventShippingForm(editedAfterEventFormShippingData))
            .then(() => browser.click(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
            .then(() => browser.isExisting(giftRegistryPage.REGISTRY_HEADING))
            .then(doesExist => assert.isTrue(doesExist))
    );

    it('Should check to verify that before event shipping info was edited', () =>
        browser.click(giftRegistryPage.BTN_NAV_SHIPPING)
            .then(() => browser.waitForVisible(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
            // checks to see that before event shipping address id changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_ID))
            .then(beforeAddressIdValue => assert.equal(beforeAddressIdValue, editedEventFormShippingData.addressid))
            // checks to see that before event shipping address first name changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_FIRST_NAME))
            .then(beforeFirstNameValue => assert.equal(beforeFirstNameValue, editedEventFormShippingData.firstname))
            // checks to see that before event shipping address last name changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_LAST_NAME))
            .then(beforeLastNameValue => assert.equal(beforeLastNameValue, editedEventFormShippingData.lastname))
            // checks to see that before event shipping address address 1 changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_ADDRESS1))
            .then(beforeAddressOneId => assert.equal(beforeAddressOneId, editedEventFormShippingData.address1))
            // checks to see that before event shipping address city changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_CITY))
            .then(beforeAddressCityValue => assert.equal(beforeAddressCityValue, editedEventFormShippingData.city))
            // checks to see that before event shipping address zip changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_ZIP_CODE))
            .then(beforeAddressZipCodeValue => assert.equal(beforeAddressZipCodeValue, editedEventFormShippingData.postal))
            // checks to see that before event shipping address country changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_COUNTRY))
            .then(beforeAddressCountryValue => assert.equal(beforeAddressCountryValue, editedEventFormShippingData.country))
            // checks to see that before event shipping address phone changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_PHONE))
            .then(beforeAddressPhoneValue => assert.equal(beforeAddressPhoneValue, editedEventFormShippingData.phone))
    );

    if (locale && (locale === 'x_default' || locale === 'en_US')) {
        it('Should check to verify that the address state value has changed', () =>
            browser.getValue(giftRegistryPage.BEFORE_SHIPPING_STATE)
                .then(beforeAddressStateValue => assert.equal(beforeAddressStateValue, editedEventFormShippingData.states_state))
        );
    }

    it('Should verify that post event shipping info was edited', () =>
        browser.getValue(giftRegistryPage.AFTER_SHIPPING_ID)
        .then(afterAddressIdValue => assert.equal(afterAddressIdValue, editedAfterEventFormShippingData.addressid))
        // checks to see that post event shipping address first name changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_FIRST_NAME))
        .then(afterFirstNameValue => assert.equal(afterFirstNameValue, editedAfterEventFormShippingData.firstname))
        // checks to see that post event shipping address last name changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_LAST_NAME))
        .then(afterLastNameValue => assert.equal(afterLastNameValue, editedAfterEventFormShippingData.lastname))
        // checks to see that post event shipping address address 1 changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_ADDRESS1))
        .then(afterAddressOneId => assert.equal(afterAddressOneId, editedAfterEventFormShippingData.address1))
        // checks to see that post event shipping address city changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_CITY))
        .then(afterAddressCityValue => assert.equal(afterAddressCityValue, editedAfterEventFormShippingData.city))
        // checks to see that post event shipping address zip changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_ZIP_CODE))
        .then(afterAddressZipCodeValue => assert.equal(afterAddressZipCodeValue, editedAfterEventFormShippingData.postal))
        // checks to see that post event shipping address country changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_COUNTRY))
        .then(afterAddressCountryValue => assert.equal(afterAddressCountryValue, editedAfterEventFormShippingData.country))
        // checks to see that post event shipping address phone changed
        .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_PHONE))
        .then(afterAddressPhoneValue => assert.equal(afterAddressPhoneValue, editedAfterEventFormShippingData.phone))
    );

    if (locale && locale === 'x_default') {
        it('Should check to verify that the post event address state value has edited', () =>
            browser.getValue(giftRegistryPage.AFTER_SHIPPING_STATE)
                .then(afterAddressStateValue => assert.equal(afterAddressStateValue, editedAfterEventFormShippingData.states_state))
        );
    }

    //Should edit everything but the addressId
    it('Should edit all the pre and post event shipping information except the addressId ', () =>
        giftRegistryPage.fillOutEventShippingForm(editedEventFormShippingData2)
            .then(() => giftRegistryPage.fillOutAfterEventShippingForm(editedAfterEventFormShippingData2))
            .then(() => browser.click(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
            .then(() => browser.isExisting(giftRegistryPage.REGISTRY_HEADING))
            .then(doesExist => assert.isTrue(doesExist))
    );


    it('Should verify that before event shipping info was edited and uses the city as the addressId', () =>
        browser.click(giftRegistryPage.BTN_NAV_SHIPPING)
            .then(() => browser.waitForVisible(giftRegistryPage.BTN_EVENT_ADDRESS_CONTINUE))
            // checks to see that before event shipping address id changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_ID))
            .then(beforeAddressIdValue => assert.equal(beforeAddressIdValue, editedEventFormShippingData2.city))
            // checks to see that before event shipping address first name changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_FIRST_NAME))
            .then(beforeFirstNameValue => assert.equal(beforeFirstNameValue, editedEventFormShippingData2.firstname))
            // checks to see that before event shipping address last name changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_LAST_NAME))
            .then(beforeLastNameValue => assert.equal(beforeLastNameValue, editedEventFormShippingData2.lastname))
            // checks to see that before event shipping address address 1 changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_ADDRESS1))
            .then(beforeAddressOneId => assert.equal(beforeAddressOneId, editedEventFormShippingData2.address1))
            // checks to see that before event shipping address city changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_CITY))
            .then(beforeAddressCityValue => assert.equal(beforeAddressCityValue, editedEventFormShippingData2.city))
            // checks to see that before event shipping address zip changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_ZIP_CODE))
            .then(beforeAddressZipCodeValue => assert.equal(beforeAddressZipCodeValue, editedEventFormShippingData2.postal))
            // checks to see that before event shipping address country changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_COUNTRY))
            .then(beforeAddressCountryValue => assert.equal(beforeAddressCountryValue, editedEventFormShippingData2.country))
            // checks to see that before event shipping address phone changed
            .then(() => browser.getValue(giftRegistryPage.BEFORE_SHIPPING_PHONE))
            .then(beforeAddressPhoneValue => assert.equal(beforeAddressPhoneValue, editedEventFormShippingData2.phone))
    );

    if (locale && (locale === 'x_default' || locale === 'en_US')) {
        it('Should verify that the address state value has changed', () =>
            browser.getValue(giftRegistryPage.BEFORE_SHIPPING_STATE)
                .then(beforeAddressStateValue => assert.equal(beforeAddressStateValue, editedEventFormShippingData2.states_state))
        );
    }

    it('Should verify that post event shipping info was edited and uses the city as the addressId', () =>
        browser.getValue(giftRegistryPage.AFTER_SHIPPING_ID)
            .then(afterAddressIdValue => assert.equal(afterAddressIdValue, editedAfterEventFormShippingData2.city))
            // checks to see that post event shipping address first name changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_FIRST_NAME))
            .then(afterFirstNameValue => assert.equal(afterFirstNameValue, editedAfterEventFormShippingData2.firstname))
            // checks to see that post event shipping address last name changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_LAST_NAME))
            .then(afterLastNameValue => assert.equal(afterLastNameValue, editedAfterEventFormShippingData2.lastname))
            // checks to see that post event shipping address address 1 changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_ADDRESS1))
            .then(afterAddressOneId => assert.equal(afterAddressOneId, editedAfterEventFormShippingData2.address1))
            // checks to see that post event shipping address city changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_CITY))
            .then(afterAddressCityValue => assert.equal(afterAddressCityValue, editedAfterEventFormShippingData2.city))
            // checks to see that post event shipping address zip changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_ZIP_CODE))
            .then(afterAddressZipCodeValue => assert.equal(afterAddressZipCodeValue, editedAfterEventFormShippingData2.postal))
            // checks to see that post event shipping address country changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_COUNTRY))
            .then(afterAddressCountryValue => assert.equal(afterAddressCountryValue, editedAfterEventFormShippingData2.country))
            // checks to see that post event shipping address phone changed
            .then(() => browser.getValue(giftRegistryPage.AFTER_SHIPPING_PHONE))
            .then(afterAddressPhoneValue => assert.equal(afterAddressPhoneValue, editedAfterEventFormShippingData2.phone))
    );

    if (locale && locale === 'x_default') {
        it('Should check to verify that the post event address state value has edited', () =>
            browser.getValue(giftRegistryPage.AFTER_SHIPPING_STATE)
                .then(afterAddressStateValue => assert.equal(afterAddressStateValue, editedAfterEventFormShippingData2.states_state))
        );
    }

    it('Should go to the purchases page in gift registry', () =>
        browser.click(giftRegistryPage.BTN_NAV_PURCHASES)
            .then(() => browser.getText(giftRegistryPage.REGISTRY_NO_PURCHASES_MSG))
            .then(text => assert.equal(text, purchasesNoProductsFound))
    );
});
