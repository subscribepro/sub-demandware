'use strict';

import {assert} from 'chai';
import {config} from '../webdriver/wdio.conf';
import url from 'url';
import * as cartPage from '../pageObjects/cart';
import * as giftCertPurchasePage from '../pageObjects/giftCertPurchase';
import * as loginForm from '../pageObjects/helpers/forms/login';
import * as loginPage from '../pageObjects/loginPage';
import * as navHeader from '../pageObjects/navHeader';
import * as productDetailPage from '../pageObjects/productDetail';
import * as Resource from '../../mocks/dw/web/Resource';
import * as testData from '../pageObjects/testData/main';
import * as wishListPage from '../pageObjects/wishList';

const userEmail = config.userEmail;

describe('Wishlist', () => {
    before(() => testData.load());

    describe('Send to Friend Links', () => {
        let socialLinks = {
            facebook: {
                selector: 'a[data-share=facebook]',
                baseUrl: 'https://www.facebook.com/sharer/sharer.php',
                regex: /.*\?.*u=.+/
            },
            twitter: {
                selector: 'a[data-share=twitter]',
                baseUrl: 'https://twitter.com/intent/tweet/',
                regex: /.*\?.*url=.+/
            },
            googlePlus: {
                selector: 'a[data-share=googleplus]',
                baseUrl: 'https://plus.google.com/share',
                regex: /.*\?.*url=.+/
            },
            pinterest: {
                selector: 'a[data-share=pinterest]',
                baseUrl: 'https://www.pinterest.com/pin/create/button/',
                regex: /.*\?.*url=.+/
            },
            emailLink: {
                selector: 'a[data-share=email]',
                baseUrl: 'mailto:name@email.com',
                regex: /.*\&.*body=.+/
            },
            shareLinkIcon: {
                selector: wishListPage.CSS_SHARE_LINK
            },
            shareLinkUrl: {
                selector: '.share-link-content a',
                baseUrl: config.baseUrl,
                regex: /.*\?.*WishListID=.+/
            }
        };

        before(() => wishListPage.navigateTo()
            .then(() => loginForm.loginAs(userEmail))
        );

        after(() => navHeader.logout());

        it('should display a Facebook icon and link', () =>
            browser.waitForExist(socialLinks.facebook.selector)
                .getAttribute(socialLinks.facebook.selector, 'href')
                .then(href => {
                    assert.isTrue(href.startsWith(socialLinks.facebook.baseUrl));
                    assert.ok(href.match(socialLinks.facebook.regex));
                })
        );

        it('should display a Twitter icon and link', () =>
            browser.waitForExist(socialLinks.twitter.selector)
                .getAttribute(socialLinks.twitter.selector, 'href')
                .then(href => {
                    assert.isTrue(href.startsWith(socialLinks.twitter.baseUrl));
                    assert.ok(href.match(socialLinks.twitter.regex));
                })
        );

        it('should display a Google Plus icon and link', () =>
            browser.waitForExist(socialLinks.googlePlus.selector)
                .getAttribute(socialLinks.googlePlus.selector, 'href')
                .then(href => {
                    assert.isTrue(href.startsWith(socialLinks.googlePlus.baseUrl));
                    assert.ok(href.match(socialLinks.googlePlus.regex));
                })
        );

        it('should display a Pinterest icon and link', () =>
            browser.waitForExist(socialLinks.pinterest.selector)
                .getAttribute(socialLinks.pinterest.selector, 'href')
                .then(href => {
                    assert.isTrue(href.startsWith(socialLinks.pinterest.baseUrl));
                    assert.ok(href.match(socialLinks.pinterest.regex));
                })
        );

        it('should display a Mail icon and link', () =>
            browser.waitForExist(socialLinks.emailLink.selector)
                .getAttribute(socialLinks.emailLink.selector, 'href')
                .then(href => {
                    assert.isTrue(href.startsWith(socialLinks.emailLink.baseUrl));
                    assert.ok(href.match(socialLinks.emailLink.regex));
                })
        );

        it('should display a link icon', () =>
            browser.isExisting(socialLinks.shareLinkIcon.selector)
                .then(doesExist => assert.isTrue(doesExist))
        );

        it('should display a URL when chain icon clicked', () =>
            browser.click(wishListPage.CSS_SHARE_LINK)
                .waitForVisible(socialLinks.shareLinkUrl.selector)
                .isVisible(socialLinks.shareLinkUrl.selector)
                .then(visible => assert.isTrue(visible))
                .then(() => browser.getAttribute(socialLinks.shareLinkUrl.selector, 'href'))
                .then(href => {
                    assert.isTrue(href.startsWith(socialLinks.shareLinkUrl.baseUrl));
                    assert.ok(href.match(socialLinks.shareLinkUrl.regex));
                })
        );
    });

    describe('Gift Certificates', () => {
        var giftCertItemSelector = 'table div a[href*=giftcertpurchase]';
        var btnGiftCertAddToCart = giftCertItemSelector + '.button';
        let giftCertFieldMap = {
            recipient: 'Joe Smith',
            recipientEmail: 'jsmith@someBogusEmailDomain.tv',
            confirmRecipientEmail: 'jsmith@someBogusEmailDomain.tv',
            message: 'Congratulations!',
            amount: '250'
        };
        before(() => wishListPage.navigateTo()
            .then(() => loginForm.loginAs(userEmail))
            .then(() => browser.waitForVisible(wishListPage.BTN_TOGGLE_PRIVACY))
            .then(() => cartPage.emptyCart())
            .then(() => wishListPage.navigateTo())
            .then(() => wishListPage.emptyWishList())
        );

        after(() => cartPage.emptyCart()
            .then(() => navHeader.logout())
        );

        it('should redirect to the Gift Certificate Purchase page when adding one to the Cart', () => {
            return wishListPage.clickAddGiftCertButton()
                .then(() => browser.click(btnGiftCertAddToCart))
                .then(() => browser.waitForVisible('.gift-certificate-purchase'))
                .then(() => browser.url())
                .then(currentUrl => {
                    let parsedUrl = url.parse(currentUrl.value);
                    return assert.isTrue(parsedUrl.pathname.endsWith('giftcertpurchase'));
                });
        });

        it('should automatically populate the Your Name field', () => {
            const defaultCustomer = testData.getCustomerByLogin(userEmail);
            return browser.getValue(giftCertPurchasePage.INPUT_FROM_FIELD)
                .then(from => {
                    const expectedYourName = defaultCustomer.firstName + ' ' + defaultCustomer.lastName;
                    assert.equal(from, expectedYourName);
                });
        });

        it('should display the correct number of items in cart page', () =>
            giftCertPurchasePage.fillOutGiftCertPurchaseForm(giftCertFieldMap)
                .then(() => giftCertPurchasePage.pressBtnAddToCart())
                .then(() => cartPage.navigateTo())
                .then(cartPage.getItemList()
                .then(rows => assert.equal(1, rows.value.length)))
        );

        it('should display the correct item name in cart page', () =>
            cartPage.getItemNameByRow(1)
                .then(name => assert.equal('Gift Certificate', name))
        );
    });

    describe('Adding Items', () => {
        let locale = config.locale;
        let productVariationMaster;
        let product = new Map();

        function addProductVariationMasterToWishList () {
            return productDetailPage.addProductVariationToWishList(product)
                // To ensure that the product has been added to the wishlist before proceeding,
                // we need to wait for a selector in the resulting page to display
                .then(() => browser.waitForVisible('table.item-list'));
        }

        describe('as a returning customer', () => {
            before(() => {
                productVariationMaster = testData.getProductVariationMaster();
                product.set('resourcePath', productVariationMaster.getUrlResourcePath());
                product.set('colorIndex', 1);
                product.set('sizeIndex', 2);
                product.set('widthIndex', 1);

                return wishListPage.navigateTo()
                    .then(() => loginForm.loginAs(userEmail))
                    .then(() => browser.waitForVisible(wishListPage.BTN_TOGGLE_PRIVACY))
                    .then(() => wishListPage.emptyWishList())
                    .then(() => addProductVariationMasterToWishList())
            });

            after(() => {
                return wishListPage.navigateTo()
                    .then(() => wishListPage.emptyWishList())
                    .then(() => navHeader.logout())
            });

            it('should directly navigate to the WishList Page', () =>
                browser.isExisting('label[for=editAddress]')
                .then(exists => assert.equal(exists, true))
            );

            it('should allow user to toggle privacy', () => {
                let privacyButton = wishListPage.BTN_TOGGLE_PRIVACY;
                return browser.waitForVisible(privacyButton)
                    .isEnabled(privacyButton)
                    .then(enabled => assert.isTrue(enabled));
            });

            it('should display the product name in the Wish List page after add items', () => {
                wishListPage.getItemNameByRow(2)
                .then(name => assert.equal(productVariationMaster.displayName[locale], name));
            });
        });

        describe('from the Cart', () => {
            const rowIndex = 1;
            const variantId = '701644062682';
            let product;

            before(() => {
                product = testData.getProductById(variantId);

                return loginPage.navigateTo()
                    .then(() => loginForm.loginAs(userEmail))
                    .then(() => browser.url(product.getUrlResourcePath()))
                    .click(productDetailPage.BTN_ADD_TO_CART)
                    .then(() => cartPage.navigateTo());
            });

            after(() => {
                return cartPage.navigateTo()
                    .then(() => cartPage.emptyCart())
                    .then(() => wishListPage.navigateTo())
                    .then(() => wishListPage.emptyWishList())
                    .then(() => navHeader.logout())
            });

            it('should notify a customer when an item is added to a Wishlist', () => {
                const expectedInWishlistText = Resource.msg('global.iteminwishlist', 'locale', null);

                return cartPage.addItemToWishlistByRow(rowIndex)
                    .then(() => cartPage.getInWishlistTextByRow(rowIndex))
                    .then(text => assert.equal(text, expectedInWishlistText));
            });

            it('should display the added item in the Wishlist', () => {
                const expectedName = product.getDisplayName(locale);

                return wishListPage.navigateTo()
                    .then(() => wishListPage.getItemNameByRow(rowIndex))
                    .then(name => assert.equal(name, expectedName));
            })
        });
    });
});
