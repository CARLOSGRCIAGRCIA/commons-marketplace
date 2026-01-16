/**
 * Creates a DTO for updating a category.
 * @param {object} data - The category update data.
 * @param {string} [data.name] - The category name.
 * @param {string} [data.slug] - The category slug.
 * @param {string} [data.description] - The category description.
 * @param {boolean} [data.isActive] - Whether the category is active.
 * @returns {object} The update category DTO.
 */
export const updateCategoryDTO = ({ name, slug, description, isActive }) => {
    const dto = {};

    if (name !== undefined) dto.name = name;
    if (slug !== undefined) dto.slug = slug.toLowerCase().trim();
    if (description !== undefined) dto.description = description;
    if (isActive !== undefined) dto.isActive = isActive;

    return dto;
};
