/**
 * @typedef {object} CreateProductDTO
 * @property {string} name - The product name.
 * @property {string} description - The product description.
 * @property {number} price - The product price.
 * @property {number} stock - The available quantity.
 * @property {string} categoryId - The ID of the category this product belongs to.
 * @property {string} categoryName - The name of the category (automatically populated).
 * @property {string} [subCategoryId] - The ID of the sub-category.
 * @property {string} [subCategoryName] - The name of the sub-category (automatically populated).
 * @property {string} sellerId - The ID of the seller publishing this product.
 * @property {string} storeId - The ID of the store this product belongs to.
 * @property {string} mainImageUrl - The URL of the main product image.
 * @property {string[]} [imageUrls] - Array of additional product images.
 */

/**
 * Factory function to create a CreateProductDTO object.
 * @param {object} data - Raw data for creating a product.
 * @param {string} data.name - The product name.
 * @param {string} data.description - The product description.
 * @param {number} data.price - The product price.
 * @param {number} data.stock - The available quantity.
 * @param {string} data.categoryId - The ID of the category this product belongs to.
 * @param {string} data.categoryName - The name of the category (automatically populated).
 * @param {string} [data.subCategoryId] - The ID of the sub-category.
 * @param {string} [data.subCategoryName] - The name of the sub-category (automatically populated).
 * @param {string} data.sellerId - The ID of the seller publishing this product.
 * @param {string} data.storeId - The ID of the store this product belongs to.
 * @param {string} data.mainImageUrl - The URL of the main product image.
 * @param {string[]} [data.imageUrls] - Array of additional product images.
 * @returns {CreateProductDTO} A new DTO object.
 */
export function createCreateProductDTO({
    name,
    description,
    price,
    stock,
    categoryId,
    categoryName,
    subCategoryId,
    subCategoryName,
    sellerId,
    storeId,
    mainImageUrl,
    imageUrls = [],
}) {
    if (
        !name ||
        price == null ||
        stock == null ||
        !categoryId ||
        !categoryName ||
        !sellerId ||
        !storeId ||
        !mainImageUrl
    ) {
        throw new Error(
            'Missing required fields for creating a product. All fields including categoryId, categoryName, and storeId are required.',
        );
    }

    return {
        name,
        description,
        price,
        stock,
        categoryId,
        categoryName,
        subCategoryId: subCategoryId || null,
        subCategoryName: subCategoryName || null,
        sellerId,
        storeId,
        mainImageUrl,
        imageUrls,
    };
}
