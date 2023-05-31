'use strict';

var Money = require('dw/value/Money');
var priceHelper = require('*/cartridge/scripts/helpers/pricing');

/**
 * @constructors
 * @classdesc The stores model
 * @param {dw.catalog.Store} storeObject - a Store objects
 */

/**
 * Get list price for a product
 *
 * @param {dw.catalog.ProductPriceModel} priceModel - Product price model
 * @return {dw.value.Money} - List price
 */
function getListPrice(priceModel) {
    var price = Money.NOT_AVAILABLE;
    var priceBook;
    var priceBookPrice;

    if (priceModel.price.valueOrNull === null && priceModel.minPrice) {
        return priceModel.minPrice;
    }

    priceBook = priceHelper.getRootPriceBook(priceModel.priceInfo.priceBook);
    priceBookPrice = priceModel.getPriceBookPrice(priceBook.ID);

    if (priceBookPrice.available) {
        return priceBookPrice;
    }

    price = priceModel.price.available ? priceModel.price : priceModel.minPrice;

    return price;
}

/**
 * Get Pricing
 * @param {dw.catalog.Product} product
 */
function getPricing(product) {
    var priceModel = product.getPriceModel(),
        pricing = {
            standard: Money.NOT_AVAILABLE,
            sale: Money.NOT_AVAILABLE,
            isSale: null,
            displayPrice: null,
            msrp: null
        },
        priceBook;

    if (empty(priceModel)) {
        return pricing;
    }

    if (priceModel.getPrice().available) {
        priceBook = priceModel.priceInfo.priceBook;
        pricing.sale = priceModel.getPriceBookPrice(priceBook.ID);

        while (priceBook.parentPriceBook) {
            priceBook = priceBook.parentPriceBook ? priceBook.parentPriceBook : priceBook;
        }

        pricing.standard = priceModel.getPriceBookPrice(priceBook.ID);
    }
    pricing.msrp = priceModel.priceInfo && priceModel.priceInfo.price ? priceModel.priceInfo.price.value : '';
    pricing.displayPrice = getListPrice(priceModel);
    pricing.isSale = isSale(priceModel);

    return pricing;
}

/**
 * Return true if the product have a sale
 * @param {dw.catalog.ProductPriceModel} priceModel
 */
function isSale(priceModel) {
    var minPrice = priceModel.price,
        maxPrice = getListPrice(priceModel);

    // if Sales price is not available then get list price as min
    if (!minPrice.available && maxPrice.available) {
        minPrice = maxPrice;
    }

    return minPrice.available && maxPrice.available && minPrice.compareTo(maxPrice) < 0 ? true : false;
}

/**
 * Get stock level quantity
 * @param {dw.catalog.Product} product
 */
function getQtyInStock(product) {
    return product.availabilityModel && product.availabilityModel.inventoryRecord && product.availabilityModel.inventoryRecord.getStockLevel().value;
}

function productSPJobModel(product) {
    var pricing = getPricing(product);
    var qty_in_stock = getQtyInStock(product);

    if (product) {
        this.sku = product.ID;
        this.name = product.name;
        this.price = (pricing.displayPrice && pricing.displayPrice.value && pricing.displayPrice.value.toString()) || '0';
        if (product.shortDescription && product.shortDescription.markup) this.short_description = product.shortDescription.markup;
        if (product.longDescription && product.longDescription.markup) this.long_description = product.longDescription.markup;
        if (product.thumbnail) this.thumbnail_url = product.thumbnail || '';
        if (pricing.msrp) this.msrp = pricing.msrp.toString();
        if (pricing.sale < pricing.standard) this.sale_price = pricing.sale.value.toString();
        if (pricing.isSale) this.is_on_sale = pricing.isSale;
        if (qty_in_stock) this.qty_in_stock = qty_in_stock.toString();
        if (product.availabilityModel.inStock) this.is_in_stock = product.availabilityModel.inStock;
    }
}

module.exports = productSPJobModel;
