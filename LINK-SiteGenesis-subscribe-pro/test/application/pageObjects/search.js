'use strict';

export const BREADCRUMB_RESULT_TEXT = '.breadcrumb-element.breadcrumb-result-text';
export const CATEGORY_BANNER = '.content-slot.slot-grid-header';
export const CONTACT_US_FORM = '#RegistrationForm';
export const LOGIN_FORM = '#dwfrm_login';
export const NO_HITS = '.no-hits-banner';
export const NO_HITS_TERM_SUGGEST = '.no-hits-search-term-suggest';
export const PDP_MAIN = '.pdp-main';
export const PRICE_LIST = '.product-pricing .product-standard-price';
export const PRICE_SALE = '.product-pricing .product-sales-price';
export const PRODUCTID_TEXT = 'span[itemprop*=productID]';
export const PRODUCTGRID_CONTAINER = '#search-result-items';
export const SEARCH_FORM = 'form[role*=search]';
export const SEARCH_SUGGESTIONS_DIV = '.search-suggestion-wrapper';
export const SEARCH_SUGGESTIONS_PHRASES = SEARCH_SUGGESTIONS_DIV + ' .phrase-suggestions .hitgroup .hit';
export const SEARCH_SUGGESTIONS_PHRASE = SEARCH_SUGGESTIONS_DIV + ' .product-suggestions .search-phrase';
export const SEARCH_SUGGESTIONS_PRODUCTS = SEARCH_SUGGESTIONS_DIV + ' .product-suggestions .product-suggestion';
export const RESULT_CONTENT = '.pt_product-search-result .search-result-content';

export const keywordMap = {
    x_default : 'bla',
    en_GB : 'bla',
    fr_FR : 'noi',
    it_IT : 'ner',
    ja_JP : 'ドレス',
    zh_CN : '黑色单'
}
export const noResultsKeyword = 'plpl';

export function getProductTilePricingByPid (pid) {
    return browser.getText('[data-itemid="' + pid + '"] .product-pricing')
        .then(pricing => pricing.trim());
}
