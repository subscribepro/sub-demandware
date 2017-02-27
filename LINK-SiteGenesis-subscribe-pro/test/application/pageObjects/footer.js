'use strict';

// Footer elememt selectors - NOTE: VERY locale-specific!
export const ABOUT_US               = '[title*="Go to About Us"]';
export const CHECK_ORDER            = '[title*="Go to Check Order"]';
export const CONTACT_US             = '[title*="Go to Contact Us"]';
export const CONTACT_US_FORM        = '#RegistrationForm';
export const FOOTER_CONTAINER       = '.footer-container';
export const GIFT_CERTIFICATES      = '[title*="Go to Gift Certificates"]';
export const GIFT_CERTIFICATES_FORM = '#GiftCertificateForm';
export const GIFT_REGISTRY          = '[title*="Go to Gift Registry"]';
export const HELP                   = '[title*="Go to Help"]';
export const HELP_PAGE              = '.customer-service-directory';
export const JOBS                   = '[title*="Go to Jobs"]';
export const MY_ACCOUNT             = '[title*="Go to My Account"]';
export const MY_ACCOUNT_OPTIONS     = 'ul.account-options';
export const PRIVACY                = '[title*="Go to Privacy"]';
export const SEND_EMAIL_BUTTON      = 'button.fa-envelope';
export const SITE_MAP               = '[title*="Go to Site Map"]';
export const TERMS_SELECTOR         = '[title*="Go to Terms"]';
export const WISH_LIST              = '[title*="Go to Wish List"]';

// Strings in content assets that should be localized
export const ABOUT_US_STRING        = 'About Us';
export const PRIVACY_POLICY_STRING  = 'Privacy Policy';
export const T_AND_C_STRING         = 'Terms & Conditions of Sale';
export const JOBS_LANDING_STRING    = 'Jobs Landing Page';

// Social link elements
export const socialLinks = {
    facebook: {
        selector: 'a[title*="Go to Facebook"]',
        baseUrl: 'https://www.facebook.com/demandware'
    },
    twitter: {
        selector: 'a[title*="Go to Twitter"]',
        baseUrl: 'https://twitter.com/demandware'
    },
    linkedin: {
        selector: 'a[title*="Go to LinkedIn"]',
        baseUrl: 'https://www.linkedin.com/company/demandware'
    },
    youtube: {
        selector: 'a[title*="Go to YouTube"]',
        baseUrl: 'https://www.youtube.com/user/demandware'
    }
};
