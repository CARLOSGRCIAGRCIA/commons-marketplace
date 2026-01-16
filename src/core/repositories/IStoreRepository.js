/**
 * @interface IStoreRepository
 * @description Defines the contract for store data persistence operations.
 * This contract is heavily based on the user's ID, as a store is a 1:1 extension of a user.
 */
export const IStoreRepository = {
    create: null,
    findById: null,
    findByUserId: null,
    findAllByUserId: null,
    findAll: null,
    updateById: null,
    updateByUserId: null,
    deleteById: null,
    deleteByUserId: null,
    countByUserId: null,
};
