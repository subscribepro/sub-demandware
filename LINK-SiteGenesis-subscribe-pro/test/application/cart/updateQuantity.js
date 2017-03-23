'use strict';

import {assert} from 'chai';
import * as cartPage from '../pageObjects/cart';
import * as productDetailPage from '../pageObjects/productDetail';
import * as testData from '../pageObjects/testData/main';
import * as Resource from '../../mocks/dw/web/Resource';

/*
 Verify:
 - Quantity in cart can be updated via directly entering the number
 - A blank value in quantity resulted in no change to the quantity
 - Entering a negative number result in a message "Please enter a
   value greater than or equal to 0."
 - Changing the quantity back to positive number result in the
   error no longer shown.

 Notes:
- The increment/decrement behavior of the input field does not need to
  be tested because they are part of HTML5 functionality.
- The cartPage.emptyCart() removes items in cart by setting the quantity
  to zero. This function is being used regularly in different tests hence
  it is indirectly verified a quantity of zero will cause the product item
  to be removed from cart; therefore no need to test it separately.
 */

describe('Cart - UpdateQuantity ', () => {
    let productVariantId1 = '061492273693';
    let productVariant1;

    before(() => {
        return testData.load()
            .then(() => {
                productVariant1 = testData.getProductById(productVariantId1);
                return browser.url(productVariant1.getUrlResourcePath());
            })
            .then(() => productDetailPage.clickAddToCartButton())
            .then(() => cartPage.navigateTo())
    });

    after(() => cartPage.emptyCart());

    it('should be able to update quantity to a valid number by directly entering the number', () =>
        cartPage.updateQuantityByRow(1, 2)
            .then(quantity => assert.equal(quantity, 2, 'Expected the product quantity updated to 2'))
    );

    it('should NOT be able to set quantity to blank, quantity remained unchanged', () =>
        cartPage.updateQuantityByRow(1, ' ')
            .then(quantity => assert.equal(quantity, 2, 'Expected the product quantity remained at 2'))
    );

    it('should show error message with negative quantity', () =>
        cartPage.updateQuantityByRow(1, -1)
            .then(quantity => assert.equal(quantity, -1, 'Expected the product quantity set to -1'))
            .then(() => {
                let invalidQtyMsg = Resource.msgf('validate.min', 'forms', null, '0');
                return cartPage.getQuantityErrorMessageByRow(1)
                    .then(errorMsg => assert.equal(errorMsg, invalidQtyMsg, 'Expected error message indicating quantity is must be greater than zero'));
            })
    );

    it('should NOT show error message with positive quantity', () =>
        cartPage.updateQuantityByRow(1, 1)
            .then(quantity => assert.equal(quantity, 1, 'Expected the product quantity can back be set back to positive number'))
            .then(() => cartPage.doesQuantityErrorMessageExistForRow(1))
            .then(doesExist => assert.isFalse(doesExist, 'Expected error message not shown'))
    );
});

