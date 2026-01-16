import CategoryModel from '../models/CategoryModel.js';

export const CategoryRepositoryImpl = {
    create: async (categoryData) => {
        const category = new CategoryModel(categoryData);
        await category.save();
        return category.toObject();
    },

    findById: async (categoryId) => {
        return await CategoryModel.findById(categoryId).lean();
    },

    findBySlug: async (slug) => {
        return await CategoryModel.findOne({ slug }).lean();
    },

    findAll: async (filter = {}, options = {}) => {
        const query = CategoryModel.find({ ...filter, isActive: true });

        if (options.populateParent) {
            query.populate('parent', 'name slug');
        }

        if (options.sort) {
            query.sort(options.sort);
        }

        return await query.lean();
    },

    findMainCategories: async () => {
        return await CategoryModel.find({ parent: null, isActive: true }).sort({ name: 1 }).lean();
    },

    findSubcategories: async (parentId) => {
        return await CategoryModel.find({ parent: parentId, isActive: true })
            .sort({ name: 1 })
            .lean();
    },

    updateById: async (categoryId, updateData) => {
        return await CategoryModel.findByIdAndUpdate(categoryId, updateData, {
            new: true,
            runValidators: true,
        }).lean();
    },

    deleteById: async (categoryId) => {
        const subcategories = await CategoryModel.countDocuments({ parent: categoryId });
        if (subcategories > 0) {
            throw new Error('Cannot delete category with subcategories');
        }

        return await CategoryModel.findByIdAndDelete(categoryId).lean();
    },

    deactivateById: async (categoryId) => {
        return await CategoryModel.findByIdAndUpdate(
            categoryId,
            { isActive: false },
            { new: true },
        ).lean();
    },
};
