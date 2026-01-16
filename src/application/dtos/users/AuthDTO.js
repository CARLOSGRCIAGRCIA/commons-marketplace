export const AuthDTO = {
    registerRequest: (data) => ({
        email: data.email,
        password: data.password,
        role: data.role || 'buyer',
    }),

    registerResponse: (user, message = 'User registered successfully') => ({
        message,
        user,
    }),

    loginRequest: (data) => ({
        email: data.email,
        password: data.password,
    }),

    loginResponse: (token, message = 'Login successful') => ({
        message,
        token,
    }),

    logoutResponse: (message = 'Logged out successfully') => ({
        message,
    }),
};
