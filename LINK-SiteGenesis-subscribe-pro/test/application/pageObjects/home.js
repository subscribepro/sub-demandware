'use strict';

const basePath = '/home';

export const MAIN_CAROUSEL = '#homepage-slider';
export const VERTICAL_CAROUSEL = '#vertical-carousel';
export const NEW_ARRIVALS = 'a[href*="new%20arrivals"]';
export const WOMENS = '.menu-category li:nth-child(2) .has-sub-menu';
export const MENS = '.menu-category li:nth-child(3) .has-sub-menu';
export const ELECTRONICS = '.menu-category li:nth-child(4) .has-sub-menu';
export const TOP_SELLERS = '.menu-category a[href*="top-seller"]';

export function navigateTo() {
    return browser.url(basePath);
}

/**
 * Move to a specific slide of the main carousel
 * @param {number} position - slide position, start from 1
 */
export function mainCarouselSlide(position) {
    var carouselControlSelector = MAIN_CAROUSEL + ' .jcarousel-control a:nth-child(' + position + ')';
    return browser.waitForExist(carouselControlSelector)
        // wait 500ms after carousel transition
        .then(() => browser.click(carouselControlSelector)).pause(500);
}

/**
 * Move to a specific slide of the vertical carousel
 * @param {number} position - slide position, start from 1
 */
export function verticalCarouselSlide(position) {
    var carouselNextSelector = VERTICAL_CAROUSEL + ' .jcarousel-next';
    return browser.waitForExist(carouselNextSelector)
        .then(() => {
            if (position !== 1) {
                return browser.click(carouselNextSelector)
                    // wait for carousel transition
                    .pause(500);
            }
        });
}

/**
 * Check if a vertical carousel slide is visible
 * @param {number} position - slide position, start from 1
 */
export function isVerticalCarouselSlideVisible(position) {
    var slideSelector = VERTICAL_CAROUSEL + ' ul li:nth-child(' + position + ') .product-tile';
    return browser.isVisible(slideSelector);
}

/**
 * Get name of product in a vertical carousel slide
 * @param {number} position - slide position, start from 1
 */
export function getVerticalCarouselProductName(position) {
    var slideProductNameSelector = VERTICAL_CAROUSEL + ' ul li:nth-child(' + position + ') .product-name a';
    return browser.getText(slideProductNameSelector);
}
