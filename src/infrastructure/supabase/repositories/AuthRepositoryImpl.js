import supabase from '../config/supabaseClient.js';
import { supabaseAdmin } from '../config/supabaseClient.js';
import {
    badRequestException,
    invalidCredentialsException,
} from '../../../presentation/exceptions/index.js';
import { log } from '../../logger/logger.js';

/**
 * Supabase Auth Repository Implementation
 * @namespace AuthRepositoryImpl
 * @description Concrete implementation of authentication repository using Supabase
 */
export const AuthRepositoryImpl = {
    /**
     * Register a new user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @param {object} [options] - Additional signup options
     * @param {object} [options.data] - Additional user metadata
     * @param {string} [options.redirectTo] - URL to redirect after confirmation
     * @returns {Promise<object>} Authentication response data
     * @throws {Error} When signup fails
     * @memberof AuthRepositoryImpl
     */
    signUp: async (email, password, options = {}) => {
        try {
            log.info('Attempting user signup', { email });

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options,
            });

            if (error) {
                log.error('Signup failed', { email, error: error.message });
                throw badRequestException(error.message);
            }

            log.info('User signed up successfully', { email, userId: data.user?.id });
            return data;
        } catch (error) {
            log.error('Exception in signUp', { email, error: error.message });
            throw error;
        }
    },

    /**
     * Authenticate user with email and password
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<object>} Authentication response with user and session
     * @throws {Error} When authentication fails
     * @memberof AuthRepositoryImpl
     */
    signIn: async (email, password) => {
        try {
            log.info('Attempting user signin', { email });

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (
                    error.message.includes('Invalid login credentials') ||
                    error.message.includes('invalid') ||
                    error.status === 400
                ) {
                    log.warn('Invalid credentials attempt', { email });
                    throw invalidCredentialsException(error.message);
                }
                log.error('Signin failed', { email, error: error.message });
                throw badRequestException(error.message);
            }

            log.info('User signed in successfully', { email, userId: data.user?.id });
            return data;
        } catch (error) {
            log.error('Exception in signIn', { email, error: error.message });
            throw error;
        }
    },

    /**
     * Sign out the current user
     * @param {string} token - User's access token
     * @returns {Promise<void>}
     * @throws {Error} When signout fails
     * @memberof AuthRepositoryImpl
     */
    signOut: async (token) => {
        try {
            log.info('Attempting user signout');

            const { error } = await supabase.auth.signOut({ accessToken: token });
            if (error) {
                log.error('Signout failed', { error: error.message });
                throw badRequestException(error.message);
            }

            log.info('User signed out successfully');
        } catch (error) {
            log.error('Exception in signOut', { error: error.message });
            throw error;
        }
    },

    /**
     * Get user information from access token
     * @param {string} token - User's access token
     * @returns {Promise<object>} User object
     * @throws {Error} When user retrieval fails
     * @memberof AuthRepositoryImpl
     */
    getUser: async (token) => {
        try {
            log.debug('Fetching user from token');

            const { data, error } = await supabase.auth.getUser(token);
            if (error) {
                log.error('Get user failed', { error: error.message });
                throw badRequestException(error.message);
            }

            log.debug('User retrieved successfully', { userId: data.user?.id });
            return data.user;
        } catch (error) {
            log.error('Exception in getUser', { error: error.message });
            throw error;
        }
    },

    /**
     * Update user metadata (admin operation)
     * @param {string} userId - User's ID in Supabase
     * @param {object} metadata - Metadata object to update
     * @returns {Promise<object>} Updated user data
     */
    updateUserMetadata: async (userId, metadata) => {
        try {
            log.info('Updating user metadata', { userId, metadataKeys: Object.keys(metadata) });

            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                // eslint-disable-next-line camelcase
                user_metadata: metadata,
            });

            if (error) {
                log.error('Supabase update error', { userId, error: error.message });
                throw badRequestException(`Failed to update user metadata: ${error.message}`);
            }

            log.info('User metadata updated successfully', { userId });
            return data;
        } catch (error) {
            log.error('Exception in updateUserMetadata', { userId, error: error.message });
            throw error;
        }
    },

    /**
     * Update user app metadata (admin operation)
     * @param {string} userId - User's ID in Supabase
     * @param {object} appMetadata - App metadata object to update
     * @returns {Promise<object>} Updated user data
     * @throws {Error} When update fails
     * @memberof AuthRepositoryImpl
     * @example
     * // Update user app metadata
     * await updateUserAppMetadata('user-id-123', { role: 'Seller' });
     */
    updateUserAppMetadata: async (userId, appMetadata) => {
        try {
            log.info('Updating user app metadata', {
                userId,
                appMetadataKeys: Object.keys(appMetadata),
            });

            const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
                // eslint-disable-next-line camelcase
                app_metadata: appMetadata,
            });

            if (error) {
                log.error('Supabase app metadata update error', { userId, error: error.message });
                throw badRequestException(`Failed to update user app metadata: ${error.message}`);
            }

            log.info('User app metadata updated successfully', { userId });
            return data;
        } catch (error) {
            log.error('Exception in updateUserAppMetadata', { userId, error: error.message });
            throw error;
        }
    },

    /**
     * Get user by ID (admin operation) - for debugging
     * @param {string} userId - User's ID in Supabase
     * @returns {Promise<object>} User data
     * @throws {Error} When user retrieval fails
     * @memberof AuthRepositoryImpl
     */
    getUserById: async (userId) => {
        try {
            log.debug('Fetching user by ID', { userId });

            const { data, error } = await supabase.auth.admin.getUserById(userId);

            if (error) {
                log.error('Error fetching user by ID', { userId, error: error.message });
                throw badRequestException(`Failed to get user: ${error.message}`);
            }

            log.debug('User fetched successfully by ID', { userId });
            return data;
        } catch (error) {
            log.error('Exception in getUserById', { userId, error: error.message });
            throw error;
        }
    },
};
