import supabase from '../../infrastructure/supabase/config/supabaseClient.js';
import {
    badRequestException,
    notFoundException,
    internalServerError,
} from '../../presentation/exceptions/index.js';
import { UserRepositoryImpl as UserRepository } from '../../infrastructure/database/mongo/repositories/userRepository.js';
import { log } from '../../infrastructure/logger/logger.js';

export const createUser = async (userData) => {
    const { _id, name, lastName, phoneNumber, address, profilePicUrl, email } = userData;

    if (!_id || typeof _id !== 'string' || _id.trim() === '') {
        throw badRequestException('User ID (_id) is required and must be a non-empty string.');
    }

    const dataToSave = {
        _id: _id.trim(),
        name: name || null,
        lastName: lastName || null,
        phoneNumber: phoneNumber || null,
        address: address || null,
        profilePicUrl: profilePicUrl,
        email: email || null,
        ...(userData.isApprovedSeller !== undefined && {
            isApprovedSeller: userData.isApprovedSeller,
        }),
    };

    try {
        const newUser = await UserRepository.create(dataToSave);
        log.info('User created successfully', { userId: newUser._id || newUser.id });
        return newUser;
    } catch (error) {
        if (error.code === 11000 || error.message.includes('already exists')) {
            log.warn('Attempt to create duplicate user', { userId: _id });
            throw badRequestException(`A record with this _id ('${_id}') already exists.`);
        }
        if (error.name === 'ValidationError') {
            const validationMessage = error.errors?.name?.message || error.message;
            log.error('User validation failed', { userId: _id, error: validationMessage });
            throw badRequestException(`Validation failed: ${validationMessage}`);
        }
        log.error('Failed to create user', { userId: _id, error: error.message });
        throw internalServerError('Failed to create user');
    }
};

export const getAllUsers = async () => {
    try {
        const users = await UserRepository.findAll();
        log.debug('Retrieved all users', { count: users.length });
        return users;
    } catch (error) {
        log.error('Failed to retrieve users', { error: error.message });
        throw internalServerError('Failed to retrieve users.');
    }
};

export const getUserById = async (id) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw badRequestException('A valid user ID must be provided.');
    }
    try {
        const user = await UserRepository.findById(id.trim());
        if (!user) {
            log.warn('User not found', { userId: id });
            throw notFoundException(`User with ID '${id}' not found.`);
        }
        log.debug('User retrieved successfully', { userId: id });
        return user;
    } catch (error) {
        if (error.name === 'NotFoundException') throw error;
        log.error('Failed to retrieve user', { userId: id, error: error.message });
        throw internalServerError(`Failed to retrieve user '${id}'.`);
    }
};

export const getUserBasicInfo = async (id) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        return {
            id: id,
            name: 'User',
            lastName: '',
            profilePicUrl: null,
            email: null,
            isApprovedSeller: false,
        };
    }

    const trimmedId = id.trim();
    try {
        const user = await UserRepository.findById(trimmedId);

        if (user) {
            return {
                id: user._id || user.id,
                name: user.name || 'Usuario',
                lastName: user.lastName || '',
                profilePicUrl: user.profilePicUrl || null,
                email: user.email || null,
                isApprovedSeller: user.isApprovedSeller || false,
            };
        } else {
            log.warn('User not found, returning default info', { userId: trimmedId });
            return {
                id: trimmedId,
                name: 'Usuario',
                lastName: '',
                profilePicUrl: null,
                email: null,
                isApprovedSeller: false,
            };
        }
    } catch (error) {
        log.error('Error getting user basic info', { userId: trimmedId, error: error.message });
        return {
            id: trimmedId,
            name: 'Usuario',
            lastName: '',
            profilePicUrl: null,
            email: null,
            isApprovedSeller: false,
        };
    }
};

export const updateUserById = async (id, updateData) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw badRequestException('A valid user ID must be provided for update.');
    }

    const allowedFields = [
        'name',
        'lastName',
        'phoneNumber',
        'address',
        'profilePicUrl',
        'isApprovedSeller',
    ];
    const dataToUpdate = {};
    let hasValidUpdateField = false;

    for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
            dataToUpdate[key] = updateData[key];
            hasValidUpdateField = true;
        }
    }

    delete dataToUpdate._id;

    if (!hasValidUpdateField) {
        throw badRequestException(
            'No valid fields provided for update. Allowed fields are: name, lastName, phoneNumber, address, profilePicUrl, isApprovedSeller.',
        );
    }

    try {
        const updatedUser = await UserRepository.updateById(id.trim(), dataToUpdate);
        if (!updatedUser) {
            log.warn('User not found for update', { userId: id });
            throw notFoundException(`User with ID '${id}' not found for update.`);
        }
        log.info('User updated successfully', { userId: id, fields: Object.keys(dataToUpdate) });
        return updatedUser;
    } catch (error) {
        if (error.name === 'NotFoundException') throw error;
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors)
                .map((e) => e.message)
                .join(', ');
            log.error('User validation failed during update', { userId: id, error: messages });
            throw badRequestException(`Validation failed during update: ${messages}`);
        }
        log.error('Failed to update user', { userId: id, error: error.message });
        throw internalServerError(`Failed to update user '${id}'.`);
    }
};

export const deleteUserById = async (id) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        throw badRequestException('A valid user ID must be provided for deletion.');
    }
    try {
        const deletedUser = await UserRepository.deleteById(id.trim());
        if (!deletedUser) {
            log.warn('User not found for deletion', { userId: id });
            throw notFoundException(`User with ID '${id}' not found for deletion.`);
        }
        log.info('User deleted successfully', { userId: id });
        return true;
    } catch (error) {
        if (error.name === 'NotFoundException') throw error;
        log.error('Failed to delete user', { userId: id, error: error.message });
        throw internalServerError(`Failed to delete user '${id}'.`);
    }
};

export const getCurrentUserProfile = async (userId, authToken) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw badRequestException('User ID is required');
    }

    try {
        const user = await UserRepository.findById(userId.trim());
        if (!user) {
            log.warn('User profile not found', { userId });
            throw notFoundException('User not found');
        }

        const {
            data: { user: supabaseUser },
            error,
        } = await supabase.auth.getUser(authToken);

        if (error) {
            log.error('Failed to fetch user from Supabase', { userId, error: error.message });
            throw internalServerError(`Failed to fetch user from Supabase: ${error.message}`);
        }

        log.debug('User profile retrieved successfully', { userId });
        return {
            name: user.name,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            address: user.address,
            profilePicUrl: user.profilePicUrl,
            email: supabaseUser.email,
        };
    } catch (error) {
        if (
            error.name === 'BadRequestException' ||
            error.name === 'NotFoundException' ||
            error.name === 'InternalServerError'
        ) {
            throw error;
        }
        log.error('Failed to fetch user profile', { userId, error: error.message });
        throw internalServerError('Failed to fetch user profile');
    }
};
