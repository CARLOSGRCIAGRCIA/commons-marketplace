/**
 * Environment configuration
 * @description Centralized configuration for different environments
 */

const environments = {
    local: {
        corsOrigins: [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://192.168.1.88:3000',
            'http://192.168.1.88:5000',
            'http://192.168.1.88:8080',
            'https://192.168.1.88:8443',
            'https://192.168.1.88:8444',
            'https://localhost:8443',
            'https://localhost:8444',
        ],
        apiUrl: 'http://localhost:3000',
        uiUrl: 'http://localhost:8080',
        enableSwagger: true,
        logLevel: 'debug',
    },
    development: {
        corsOrigins: [
            ''
        ],
        apiUrl: '',
        uiUrl: '',
        enableSwagger: true,
        logLevel: 'debug',
    },
    production: {
        corsOrigins: ['', ''],
        apiUrl: '',
        uiUrl: '',
        enableSwagger: false,
        logLevel: 'error',
    },
    test: {
        corsOrigins: ['http://localhost:3000'],
        apiUrl: 'http://localhost:5000',
        uiUrl: 'http://localhost:3000',
        enableSwagger: false,
        logLevel: 'silent',
    },
};

/**
 * Get current environment configuration
 * @returns {object} Environment configuration
 */
const getEnvironmentConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    const config = environments[env];

    if (!config) {
        throw new Error(`Unknown environment: ${env}`);
    }

    return {
        ...config,
        nodeEnv: env,
        port: parseInt(process.env.PORT || '3000', 10),
        // Database
        dbUrl: process.env.DB_URL,
        // Supabase
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'CommonMarketplace',
        // Ably
        ablyApiKey: process.env.ABLY_API_KEY,
    };
};

/**
 * Validate required environment variables
 * @throws {Error} If required variables are missing
 */
const validateEnvironment = () => {
    const required = [
        'DB_URL',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'ABLY_API_KEY',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

export { getEnvironmentConfig, validateEnvironment };
