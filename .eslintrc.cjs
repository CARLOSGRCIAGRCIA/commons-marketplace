module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'google', 'prettier', 'plugin:jsdoc/recommended'],
    plugins: ['filenames', 'jsdoc'],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        // Enforce camelCase for variable and property names
        camelcase: ['error', { properties: 'always' }],

        // JSDoc rules
        'jsdoc/require-param-type': 'warn',
        'jsdoc/require-returns-type': 'warn',
        'jsdoc/check-tag-names': 'off',
        'jsdoc/check-param-names': 'error',
        'jsdoc/check-alignment': 'warn',
        'jsdoc/require-description': 'warn',
        'jsdoc/require-jsdoc': [
            'warn',
            {
                require: {
                    FunctionDeclaration: true,
                    MethodDefinition: true,
                    ClassDeclaration: true,
                    ArrowFunctionExpression: false,
                    FunctionExpression: false,
                },
            },
        ],

        'valid-jsdoc': 'off',
        'new-cap': ['error', { newIsCap: true, capIsNew: true, capIsNewExceptions: ['Router'] }],
    },

    overrides: [
        {
            files: [
                'jest.config.js',
                'jest.setup.js',
                'babel.config.js',
                '**/*.test.js',
                '**/*.spec.js',
            ],
            rules: {
                'filenames/match-regex': 'off',
            },
            env: {
                jest: true,
            },
        },
    ],
};
