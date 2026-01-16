import supabase from '../../infrastructure/supabase/config/supabaseClient.js';
import {
    badRequestException,
    unauthorizedException,
    internalServerError,
} from '../../presentation/exceptions/index.js';
import { createUser } from './userService.js';

export const register = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                role: 'buyer',
            },
        },
    });

    if (error) throw badRequestException(error.message);

    const supabaseId = data.user.id;

    try {
        const newUser = await createUser({
            _id: supabaseId,
            name: null,
            isApprovedSeller: false,
        });

        return {
            message: 'User registered successfully',
            user: newUser,
        };
    } catch (error) {
        throw internalServerError('Registration failed' + error);
    }
};

export const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw unauthorizedException(error.message);

    return {
        message: 'Login successful',
        token: data.session,
    };
};

export const logout = async (token) => {
    const { error } = await supabase.auth.signOut({ accessToken: token });

    if (error) throw badRequestException(error.message);

    return {
        message: 'Logged out successfully',
    };
};
