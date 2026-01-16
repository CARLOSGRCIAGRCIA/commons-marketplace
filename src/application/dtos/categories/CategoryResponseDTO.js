/**
 * Creates a DTO for a category response.
 * @param {object} category - The category object from database.
 * @param {string} category._id - The category ID.
 * @param {string} category.id - The category ID (alternative).
 * @param {string} category.name - The category name.
 * @param {string} category.slug - The category slug.
 * @param {string} category.description - The category description.
 * @param {string} category.parent - The parent category ID.
 * @param {number} category.level - The category level (0: main, 1: subcategory).
 * @param {boolean} category.isActive - Whether the category is active.
 * @param {object} [category.parentDetails] - The parent category details (populated).
 * @returns {object} The category response DTO.
 */
export const categoryResponseDTO = (category) => ({
    id: category._id?.toString() || category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    parent: category.parent || null,
    parentName: category.parentDetails?.name || null,
    level: category.level,
    isActive: category.isActive,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
});
