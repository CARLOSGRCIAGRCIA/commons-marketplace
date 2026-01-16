import ReviewModel from '../models/ReviewModel.js';
import mongoose from 'mongoose';
import {
    createRecord,
    findRecordById,
    findAllRecords,
    updateRecord,
    deleteRecord,
} from './interfaces/genericRepositoryInterface.js';

export const ReviewRepositoryImpl = {
    create: (reviewData) => {
        if (!reviewData._id && !reviewData.id) {
            const newId = new mongoose.Types.ObjectId().toString();
            reviewData._id = newId;
        } else if (reviewData.id && !reviewData._id) {
            reviewData._id = reviewData.id;
        }
        return createRecord(ReviewModel, reviewData);
    },

    findById: (reviewId) => findRecordById(ReviewModel, reviewId),

    findAll: (filter = {}, options = {}) => findAllRecords(ReviewModel, filter, null, options),

    updateById: (reviewId, updateData) => updateRecord(ReviewModel, reviewId, updateData),

    deleteById: (reviewId) => deleteRecord(ReviewModel, reviewId),

    findByUserId: (userId) => findAllRecords(ReviewModel, { userId }),

    findByUserIdAndId: (userId, reviewId) => ReviewModel.findOne({ _id: reviewId, userId }).exec(),
};
