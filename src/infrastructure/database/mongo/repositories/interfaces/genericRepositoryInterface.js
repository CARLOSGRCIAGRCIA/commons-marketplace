import mongoose from 'mongoose';

/**
 * Creates a new document in the specified Mongoose model.
 * @async
 * @function createRecord
 * @param {mongoose.Model} model - The Mongoose model to use for creation.
 * @param {object} data - The data object representing the document to create.
 * @returns {Promise<object>} The newly created document.
 * @example
 * const user = await createRecord(UserModel, { name: 'John', email: 'john@example.com' });
 */

export const createRecord = async (model, data) => {
    return model.create(data);
};

/**
 * Finds a document by its ID.
 * @async
 * @function findRecordById
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {string} id - The unique identifier of the document.
 * @returns {Promise<object | null>} The found document as a plain object, or `null` if not found or invalid ID.
 */

export const findRecordById = async (model, id) => {
    try {
        return await model.findById(id).lean();
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return null;
        }
        throw error;
    }
};

/**
 * Finds a single document matching the given filter.
 * @async
 * @function findOneRecord
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {object} [filter={}] - MongoDB filter object.
 * @param {object | null} [projection=null] - Fields to include or exclude.
 * @returns {Promise<object | null>} The found document as a plain object, or `null` if not found.
 */

export const findOneRecord = async (model, filter = {}, projection = null) => {
    return await model.findOne(filter, projection).lean();
};

/**
 * Finds multiple documents matching the given filter.
 * @async
 * @function findAllRecords
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {object} [filter={}] - MongoDB filter object.
 * @param {object | null} [projection=null] - Fields to include or exclude.
 * @param {object} [options={}] - Query options such as `limit`, `sort`, or `skip`.
 * @returns {Promise<object[]>} An array of matching documents as plain objects.
 */

export const findAllRecords = async (model, filter = {}, projection = null, options = {}) => {
    const defaultOptions = {
        lean: true,
        limit: 100,
        ...options,
    };
    return await model.find(filter, projection, defaultOptions);
};

/**
 * Updates a document by its ID.
 * @async
 * @function updateRecord
 * @param {mongoose.Model} model - The Mongoose model to update.
 * @param {string} id - The unique identifier of the document.
 * @param {object} data - The updated data to apply.
 * @returns {Promise<object | null>} The updated document as a plain object, or `null` if not found or invalid ID.
 */

export const updateRecord = async (model, id, data) => {
    try {
        return await model.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
            lean: true,
        });
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return null;
        }
        throw error;
    }
};

/**
 * Deletes a document by its ID.
 * @async
 * @function deleteRecord
 * @param {mongoose.Model} model - The Mongoose model to delete from.
 * @param {string} id - The unique identifier of the document.
 * @returns {Promise<object | null>} The deleted document as a plain object, or `null` if not found or invalid ID.
 */

export const deleteRecord = async (model, id) => {
    try {
        return await model.findByIdAndDelete(id).lean();
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return null;
        }
        throw error;
    }
};

/**
 * Counts the number of documents matching the given filter.
 * @async
 * @function countRecords
 * @param {mongoose.Model} model - The Mongoose model to count documents from.
 * @param {object} [filter={}] - MongoDB filter object.
 * @returns {Promise<number>} The number of matching documents.
 */

export const countRecords = async (model, filter = {}) => {
    return await model.countDocuments(filter);
};

/**
 * Checks whether a document matching the given filter exists.
 * @async
 * @function existsRecord
 * @param {mongoose.Model} model - The Mongoose model to query.
 * @param {object} [filter={}] - MongoDB filter object.
 * @returns {Promise<object | null>} A truthy value if the record exists, otherwise `null`.
 */

export const existsRecord = async (model, filter = {}) => {
    return await model.exists(filter);
};

/**
 * Updates multiple documents matching the given filter.
 * @async
 * @function updateManyRecords
 * @param {mongoose.Model} model - The Mongoose model to update.
 * @param {object} filter - MongoDB filter object to match documents.
 * @param {object} updateData - The update operations to apply.
 * @param {object} [options={}] - Optional query options (e.g. `multi`, `upsert`).
 * @returns {Promise<mongoose.UpdateWriteOpResult>} The result of the update operation.
 */

export const updateManyRecords = async (model, filter, updateData, options = {}) => {
    return await model.updateMany(filter, updateData, options);
};
