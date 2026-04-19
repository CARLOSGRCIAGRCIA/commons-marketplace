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
            branches: 65,
            functions: 64,
            lines: 73,
            statements: 73,
        },
    },
    setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
