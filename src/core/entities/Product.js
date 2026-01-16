/**
 * Represents a product in the system.
 * @typedef {object} Product
 * @property {string} id - The product's unique identifier.
 * @property {string} name - The display name of the product.
 * @property {string} description - A detailed description of the product.
 * @property {number} price - The selling price of the product.
 * @property {number} stock - The number of items available in inventory.
 * @property {string} categoryId - The ID of the category this product belongs to.
 * @property {string} sellerId - The ID of the user who is selling this product.
 * @property {string} storeId - The ID of the store this product belongs to.
 * @property {string} mainImageUrl - The public URL of the product's main image.
 * @property {string[]} imageUrls - Array of additional product images.
 */

/**
 * Factory function to create a validated Product object.
 * @param {object} data - Raw data for the product.
 * @param {string} data.id - The product ID.
 * @param {string} data.name - The product name.
 * @param {string} data.description - The product description.
 * @param {number} data.price - The product price.
 * @param {number} data.stock - The available quantity.
 * @param {string} data.categoryId - Reference to the Category ID.
 * @param {string} data.sellerId - Reference to the Seller's User ID.
 * @param {string} data.storeId - Reference to the Store ID.
 * @param {string} data.mainImageUrl - URL of the main product image.
 * @param {string[]} [data.imageUrls] - Array of additional product images.
 * @returns {Product} A product object.
 * @throws {Error} If required fields are missing.
 */
export function createProduct({
    id,
    name,
    description,
    price,
    stock,
    categoryId,
    sellerId,
    storeId,
    mainImageUrl,
    imageUrls = [],
}) {
    if (!name || price == null || stock == null) {
        throw new Error('Product name, price, and stock are required.');
    }
    if (!storeId) {
        throw new Error('Product must be associated with a store.');
    }
    return {
        id,
        name,
        description,
        price,
        stock,
        categoryId,
        sellerId,
        storeId,
        mainImageUrl,
        imageUrls,
    };
}
