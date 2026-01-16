/**
 * @typedef {object} UpdateProductDTO
 * @property {string} [name] - The product name.
 * @property {string} [description] - The product description.
 * @property {number} [price] - The product price.
 * @property {number} [stock] - The available quantity.
 * @property {string} [categoryId] - The ID of the category this product belongs to.
 * @property {string} [categoryName] - The name of the category (automatically populated).
 * @property {string} [subCategoryId] - The ID of the sub-category.
 * @property {string} [subCategoryName] - The name of the sub-category (automatically populated).
 * @property {string} [mainImageUrl] - The URL of the main product image.
 * @property {string[]} [imageUrls] - Array of additional product images.
 * @property {string} [status] - The product status.
 */

/**
 * Factory function to create an UpdateProductDTO object.
 * Filters out undefined properties and handles category name resolution.
 * @param {object} data - Raw data for updating a product.
 * @param {string} [data.name] - The product name.
 * @param {string} [data.description] - The product description.
 * @param {number} [data.price] - The product price.
 * @param {number} [data.stock] - The available quantity.
 * @param {string} [data.categoryId] - The ID of the category this product belongs to.
 * @param {string} [data.categoryName] - The name of the category.
 * @param {string} [data.subCategoryId] - The ID of the sub-category.
 * @param {string} [data.subCategoryName] - The name of the sub-category.
 * @param {string} [data.mainImageUrl] - The URL of the main product image.
 * @param {string[]} [data.imageUrls] - Array of additional product images.
 * @param {string} [data.status] - The product status.
 * @returns {UpdateProductDTO} A frozen DTO containing only the valid fields to be updated.
 * @throws {Error} If no valid fields are provided.
 */
export function createUpdateProductDTO({
    name,
    description,
    price,
    stock,
    categoryId,
    categoryName,
    subCategoryId,
    subCategoryName,
    mainImageUrl,
    imageUrls,
    status,
}) {
    const dto = {};

    if (name !== undefined) dto.name = name;
    if (description !== undefined) dto.description = description;
    if (price !== undefined) dto.price = price;
    if (stock !== undefined) dto.stock = stock;
    if (categoryId !== undefined) dto.categoryId = categoryId;
    if (categoryName !== undefined) dto.categoryName = categoryName;
    if (subCategoryId !== undefined) dto.subCategoryId = subCategoryId;
    if (subCategoryName !== undefined) dto.subCategoryName = subCategoryName;
    if (mainImageUrl !== undefined) dto.mainImageUrl = mainImageUrl;
    if (imageUrls !== undefined) dto.imageUrls = imageUrls;
    if (status !== undefined) dto.status = status;

    if (Object.keys(dto).length === 0) {
        throw new Error('At least one field must be provided for update.');
    }

    return Object.freeze(dto);
}
