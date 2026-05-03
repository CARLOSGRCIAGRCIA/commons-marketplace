export const paginateQuery = async (Model, query, options = { page: 1, limit: 10 }, sort = {}) => {
    const { page, limit } = options;
    const skip = (page - 1) * limit;
    const sortOptions = Object.keys(sort).length > 0 ? sort : { createdAt: -1 };

    const [data, totalItems] = await Promise.all([
        Model.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
        Model.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return {
        data,
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
