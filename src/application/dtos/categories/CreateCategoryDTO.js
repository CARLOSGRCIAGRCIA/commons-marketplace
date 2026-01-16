/**
 * Creates a DTO for creating a category.
 * @param {object} data - The category data.
 * @param {string} data.name - The category name.
 * @param {string} data.slug - The category slug (URL-friendly).
 * @param {string} data.description - The category description.
 * @param {string} [data.parent] - The parent category ID (for subcategories).
 * @returns {{name: string, slug: string, description: string, parent: string|null, level: number}} The create category DTO.
 */
export const createCategoryDTO = ({ name, slug, description, parent }) => ({
    name,
    slug: slug.toLowerCase().trim(),
    description: description || '',
    parent: parent || null,
    level: parent ? 1 : 0,
});
