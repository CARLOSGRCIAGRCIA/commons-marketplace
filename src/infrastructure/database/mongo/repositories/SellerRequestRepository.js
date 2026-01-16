import SellerRequestModel from '../models/SellerRequestModel.js';
import {
    createRecord,
    findRecordById,
    findAllRecords,
    updateRecord,
    deleteRecord,
} from './interfaces/genericRepositoryInterface.js';

/**
 * Creates a new seller request
 * @param {object} requestData - Seller request data
 * @returns {Promise<object>} Created seller request
 */
export const create = (requestData) => createRecord(SellerRequestModel, requestData);

/**
 * Finds a seller request by ID
 * @param {string} requestId - Seller request ID
 * @returns {Promise<object | null>} Seller request or null
 */
export const findById = (requestId) => findRecordById(SellerRequestModel, requestId);

/**
 * Finds all seller requests with optional filter and options
 * @param {object} filter - Query filter
 * @param {object} options - Query options (pagination, sort)
 * @returns {Promise<Array>} Array of seller requests
 */
export const findAll = (filter = {}, options = {}) =>
    findAllRecords(SellerRequestModel, filter, null, options);

/**
 * Finds the most recent seller request by user ID
 * @param {string} userId - User ID
 * @returns {Promise<object | null>} Seller request or null
 */
export const findByUserId = (userId) =>
    SellerRequestModel.findOne({ userId }).sort({ createdAt: -1 }).lean();

/**
 * Updates a seller request by ID
 * @param {string} requestId - Seller request ID
 * @param {object} updateData - Data to update
 * @returns {Promise<object | null>} Updated seller request or null
 */
export const updateById = (requestId, updateData) =>
    updateRecord(SellerRequestModel, requestId, updateData);

/**
 * Deletes a seller request by ID
 * @param {string} requestId - Seller request ID
 * @returns {Promise<object>} Deleted seller request
 */
export const deleteById = (requestId) => deleteRecord(SellerRequestModel, requestId);
