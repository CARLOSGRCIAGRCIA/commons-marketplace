/**
 * @typedef {object} CreateStoreDTO
 * @property {string} userId - The ID of the user who will own the store (from auth).
 * @property {string} storeName - The name of the new store.
 * @property {string} [description] - An optional description for the store.
 * @property {string} [logo] - An optional logo URL for the store.
 * @property {string[]} [categoryIds] - Array of category IDs the store sells.
 * @property {number} [productCount] - Number of products in the store.
 */

/**
 * Factory function to create a CreateStoreDTO object.
 * @param {object} data - Raw data for creating a store.
 * @param {string} data.userId - The ID of the authenticated user (from req.user.id).
 * @param {string} data.storeName - The name of the new store.
 * @param {string} [data.description] - An optional description for the store.
 * @param {string} [data.logo] - An optional logo URL for the store.
 * @param {string[]} [data.categoryIds] - Array of category IDs.
 * @param {number} [data.productCount] - Product count (default 0).
 * @returns {CreateStoreDTO} The created and frozen DTO object.
 * @throws {Error} If required fields are missing.
 */
export function createCreateStoreDTO({ userId, storeName, seoTitle, seoDescription, description, logo, categoryIds, productCount }) {
    if (!userId || !storeName) {
        throw new Error('userId and storeName are required to create a store.');
    }

    const slug = storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const dto = {
        userId: userId,
        storeName: storeName,
        slug: slug,
        seoTitle: seoTitle ?? storeName,
        seoDescription: seoDescription ?? description ?? '',
        description: description ?? '',
        logo: logo ?? null,
        categoryIds: categoryIds ?? [],
        productCount: productCount ?? 0,
    };

    return Object.freeze(dto);
}
