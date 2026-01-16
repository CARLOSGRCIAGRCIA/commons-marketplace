import { updateCategoryDTO, categoryResponseDTO } from '../../dtos/categories/index.js';

export const updateCategoryUseCase = (categoryRepository) => async (id, updateData) => {
    const categoryDTO = updateCategoryDTO(updateData);

    if (Object.keys(categoryDTO).length === 0) {
        throw new Error('At least one field must be provided for update');
    }

    const updatedCategory = await categoryRepository.updateById(id, categoryDTO);
    if (!updatedCategory) {
        return null;
    }
    return categoryResponseDTO(updatedCategory);
};
