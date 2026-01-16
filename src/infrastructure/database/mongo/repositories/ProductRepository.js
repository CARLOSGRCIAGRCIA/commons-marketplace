import ProductModel from '../models/ProductModel.js';

export const ProductRepositoryImpl = {
    async create(productData) {
        const product = new ProductModel(productData);
        await product.save();
        return product.toObject();
    },

    async findById(productId) {
        return await ProductModel.findById(productId).lean();
    },

    async findAll(filters = {}, options = { page: 1, limit: 10 }, sort = {}) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const queryFilters = { ...filters };

        if (filters.categoryId) {
            queryFilters.categoryId = filters.categoryId;
        }

        if (filters.subCategoryId) {
            queryFilters.subCategoryId = filters.subCategoryId;
        }

        if (!filters.status) {
            queryFilters.status = 'Active';
        }

        const [data, totalItems] = await Promise.all([
            ProductModel.find(queryFilters).sort(sortOptions).skip(skip).limit(limit).lean(),
            ProductModel.countDocuments(queryFilters),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async findByStoreId(storeId, options = { page: 1, limit: 10 }, sort = {}) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const [data, totalItems] = await Promise.all([
            ProductModel.find({ storeId, status: 'Active' })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments({ storeId, status: 'Active' }),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async findByCategoryId(categoryId, options = { page: 1, limit: 10 }, sort = {}) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const [data, totalItems] = await Promise.all([
            ProductModel.find({ categoryId, status: 'Active' })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments({ categoryId, status: 'Active' }),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async findBySubCategoryId(subCategoryId, options = { page: 1, limit: 10 }, sort = {}) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const [data, totalItems] = await Promise.all([
            ProductModel.find({ subCategoryId, status: 'Active' })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments({ subCategoryId, status: 'Active' }),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async findByCategoryAndSubCategory(
        categoryId,
        subCategoryId,
        options = { page: 1, limit: 10 },
        sort = {},
    ) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const [data, totalItems] = await Promise.all([
            ProductModel.find({
                categoryId,
                subCategoryId,
                status: 'Active',
            })
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            ProductModel.countDocuments({
                categoryId,
                subCategoryId,
                status: 'Active',
            }),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async updateById(productId, updateData) {
        return await ProductModel.findByIdAndUpdate(productId, updateData, { new: true }).lean();
    },

    async deleteById(productId) {
        return await ProductModel.findByIdAndDelete(productId).lean();
    },

    async count(filters = {}) {
        const queryFilters = { ...filters };
        if (!filters.status) {
            queryFilters.status = 'Active';
        }
        return await ProductModel.countDocuments(queryFilters);
    },

    async countByStoreId(storeId) {
        return await ProductModel.countDocuments({ storeId, status: 'Active' });
    },

    async countByCategoryId(categoryId) {
        return await ProductModel.countDocuments({ categoryId, status: 'Active' });
    },

    async countBySubCategoryId(subCategoryId) {
        return await ProductModel.countDocuments({ subCategoryId, status: 'Active' });
    },

    async searchProducts(searchTerm, filters = {}, options = { page: 1, limit: 10 }, sort = {}) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const searchFilter = {
            status: 'Active',
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } },
                { categoryName: { $regex: searchTerm, $options: 'i' } },
                { subCategoryName: { $regex: searchTerm, $options: 'i' } },
            ],
        };

        const queryFilters = { ...searchFilter, ...filters };

        const [data, totalItems] = await Promise.all([
            ProductModel.find(queryFilters).sort(sortOptions).skip(skip).limit(limit).lean(),
            ProductModel.countDocuments(queryFilters),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async findProductsByPriceRange(
        minPrice,
        maxPrice,
        filters = {},
        options = { page: 1, limit: 10 },
        sort = {},
    ) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const priceFilter = {
            status: 'Active',
            price: { $gte: minPrice, $lte: maxPrice },
        };

        const queryFilters = { ...priceFilter, ...filters };

        const [data, totalItems] = await Promise.all([
            ProductModel.find(queryFilters).sort(sortOptions).skip(skip).limit(limit).lean(),
            ProductModel.countDocuments(queryFilters),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },

    async findProductsWithCategoryInfo(filters = {}, options = { page: 1, limit: 10 }, sort = {}) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

        const queryFilters = { ...filters };
        if (!filters.status) {
            queryFilters.status = 'Active';
        }

        const [data, totalItems] = await Promise.all([
            ProductModel.find(queryFilters).sort(sortOptions).skip(skip).limit(limit).lean(),
            ProductModel.countDocuments(queryFilters),
        ]);

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalItems / limit),
            hasPrevPage: page > 1,
        };
    },
};
