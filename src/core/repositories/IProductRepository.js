/**
 * @interface IProductRepository
 * @description Defines the contract for product data persistence.
 */
export const IProductRepository = {
    create: null,
    findById: null,
    findAll: null, // Should accept pagination options { page, limit }
    updateById: null,
    deleteById: null,
    count: null,
};
