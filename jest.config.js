export default {
    testPathIgnorePatterns: [
        '/node_modules/',
        '/test/e2e/',
        '/test/integration/',
    ],
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
            branches: 68,
            functions: 69,
            lines: 78,
            statements: 78,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
