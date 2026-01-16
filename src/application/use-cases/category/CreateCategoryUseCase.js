import { createCategoryDTO, categoryResponseDTO } from '../../dtos/categories/index.js';
import { badRequestException } from '../../../presentation/exceptions/badRequestException.js';

export const createCategoryUseCase = (categoryRepository) => async (categoryData) => {
    if (!categoryData.name || !categoryData.slug) {
        throw badRequestException('Category name and slug are required');
    }

    const existingCategory = await categoryRepository.findBySlug(categoryData.slug);
    if (existingCategory) {
        throw badRequestException('Category with this slug already exists');
    }

    if (categoryData.parent) {
        const parentCategory = await categoryRepository.findById(categoryData.parent);
        if (!parentCategory) {
            throw badRequestException('Parent category not found');
        }
        if (parentCategory.level !== 0) {
            throw badRequestException('Cannot create subcategory of another subcategory');
        }
    }

    const categoryDTO = createCategoryDTO(categoryData);
    const newCategory = await categoryRepository.create(categoryDTO);
    return categoryResponseDTO(newCategory);
};
