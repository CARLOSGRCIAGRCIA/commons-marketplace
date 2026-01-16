export default {
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!**/node_modules/**',
        '!**/test/**',
        '!**/*.test.js',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/exceptions/',
        '/database/',
        '/config/',
        '/routes/',
        'app.js',
    ],
    coverageReporters: ['text', 'lcov', 'cobertura'],
    coverageThreshold: {
        global: {
            branches: 1,
            functions: 0.8,
            lines: 1,
            statements: 1,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
