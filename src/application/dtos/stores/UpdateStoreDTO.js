/**
 * @typedef {object} UpdateStoreDTO
 * @property {string} [storeName] - The new name for the store.
 * @property {string} [description] - The new description for the store.
 * @property {string} [logo] - The new logo URL for the store.
 */

/**
 * Factory function to create an UpdateStoreDTO object.
 * It filters out undefined properties.
 * @param {object} data - Raw data for updating a store.
 * @param {string} [data.storeName] - The new name for the store, if provided.
 * @param {string} [data.description] - The new description for the store, if provided.
 * @param {string} [data.logo] - The new logo URL for the store, if provided.
 * @returns {UpdateStoreDTO} A frozen DTO containing only the valid fields to be updated.
 * @throws {Error} If no valid fields are provided.
 */
export function createUpdateStoreDTO({ storeName, description, logo }) {
    const dto = {};

    if (storeName !== undefined) dto.storeName = storeName;
    if (description !== undefined) dto.description = description;
    if (logo !== undefined) dto.logo = logo;

    if (Object.keys(dto).length === 0) {
        throw new Error(
            'At least one field (storeName, description, logo) must be provided for an update.',
        );
    }

    return Object.freeze(dto);
}
