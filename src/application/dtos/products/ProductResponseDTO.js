/**
 * @typedef {object} ProductResponseDTO
 * @property {string} id - The product's unique identifier.
 * @property {string} name - The product name.
 * @property {string} description - The product description.
 * @property {number} price - The product price.
 * @property {number} stock - The available quantity.
 * @property {string} categoryId - The ID of the category this product belongs to.
 * @property {string} categoryName - The name of the category.
 * @property {string|null} subCategoryId - The ID of the sub-category.
 * @property {string|null} subCategoryName - The name of the sub-category.
 * @property {string} sellerId - The ID of the seller publishing this product.
 * @property {string} storeId - The ID of the store this product belongs to.
 * @property {string} mainImageUrl - The URL of the main product image.
 * @property {string[]} imageUrls - Array of additional product images.
 * @property {string} status - The current status of the product.
 * @property {string} createdAt - Product creation timestamp.
 * @property {string} updatedAt - Product last update timestamp.
 */

/**
 * Factory function to create a ProductResponseDTO from a database object.
 * @param {object} product - The product object from the database.
 * @returns {ProductResponseDTO | null} The formatted DTO for the product, or null if the input product is falsy.
 */
export function createProductResponseDTO(product) {
    if (!product) return null;

    const dto = {
        id: product._id?.toString() || product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        subCategoryId: product.subCategoryId || null,
        subCategoryName: product.subCategoryName || null,
        sellerId: product.sellerId,
        storeId: product.storeId,
        mainImageUrl: product.mainImageUrl,
        imageUrls: product.imageUrls || [],
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };

    return Object.freeze(dto);
}
