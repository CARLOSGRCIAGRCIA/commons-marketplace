import UserModel from '../models/UserModel.js';
import {
    createRecord,
    findRecordById,
    findAllRecords,
    updateRecord,
    deleteRecord,
    findOneRecord,
} from './interfaces/genericRepositoryInterface.js';

export const UserRepositoryImpl = {
    create: (userData) => createRecord(UserModel, userData),

    findById: (userId) => findRecordById(UserModel, userId),

    findAll: (filter = {}, options = {}) => findAllRecords(UserModel, filter, null, options),

    updateById: (userId, updateData) => updateRecord(UserModel, userId, updateData),

    deleteById: (userId) => deleteRecord(UserModel, userId),

    findByEmail: (email) => findOneRecord(UserModel, { email }),
};
