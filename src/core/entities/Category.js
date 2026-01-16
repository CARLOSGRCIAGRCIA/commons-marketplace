/**
 * Creates a category object.
 * @param {object} data - The category data.
 * @param {string} data.id - The category ID.
 * @param {string} data.name - The category name.
 * @param {string} data.description - The category description.
 * @param {string[]} data.subCategories - The sub-categories.
 * @returns {object} The frozen category object.
 */
export const createCategory = ({ id, name, description, subCategories }) => {
    return Object.freeze({
        id,
        name,
        description,
        subCategories,
    });
};
