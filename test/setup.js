/* eslint-env jest */
jest.mock('../src/infrastructure/logger/logger.js', () => ({
    log: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        http: jest.fn(),
        debug: jest.fn(),
    },
    default: {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        http: jest.fn(),
        debug: jest.fn(),
    },
}));
