/**
 * @typedef {object} StoreResponseDTO
 * @property {string} id - The store's unique identifier.
 * @property {string} userId - The owner's user ID.
 * @property {string} storeName - The public name of the store.
 * @property {string} description - The store's description.
 * @property {string|null} logo - The store's logo URL.
 * @property {string} status - The current status of the store.
 * @property {string[]} categoryIds - Array of category IDs the store sells.
 * @property {number} productCount - Number of products in the store.
 * @property {string} createdAt - Store creation timestamp.
 * @property {string} updatedAt - Store last update timestamp.
 */

/**
 * Factory function to create a StoreResponseDTO from a database object.
 * @param {object} store - The store object from the database.
 * @returns {StoreResponseDTO | null} The formatted DTO for the store, or null if the input store is falsy.
 */
export function createStoreResponseDTO(store) {
    if (!store) return null;

    const dto = {
        id: store._id?.toString() || store.id,
        _id: store._id?.toString() || store.id,
        userId: store.userId,
        storeName: store.storeName,
        slug: store.slug,
        description: store.description,
        seoTitle: store.seoTitle,
        seoDescription: store.seoDescription,
        ogImage: store.ogImage || store.logo,
        logo: store.logo || null,
        status: store.status,
        categoryIds: store.categoryIds || [],
        productCount: store.productCount || 0,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
    };

    return Object.freeze(dto);
}
