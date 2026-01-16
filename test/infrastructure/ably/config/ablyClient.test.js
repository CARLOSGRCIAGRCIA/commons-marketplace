import Ably from 'ably';

jest.mock('ably');

describe('Ably Client', () => {
    let originalEnv;
    let getAblyClient;

    beforeAll(() => {
        originalEnv = process.env;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };

        jest.resetModules();
        jest.isolateModules(() => {
            ({
                getAblyClient,
            } = require('../../../../src/infrastructure/ably/config/ablyClient.js'));
        });
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('getAblyClient', () => {
        it('should throw an error if ABLY_API_KEY is not defined', () => {
            delete process.env.ABLY_API_KEY;

            expect(() => getAblyClient()).toThrow('ABLY_API_KEY is not defined');
            expect(Ably.Rest).not.toHaveBeenCalled();
        });

        it('should throw an error if ABLY_API_KEY is empty string', () => {
            process.env.ABLY_API_KEY = '';

            expect(() => getAblyClient()).toThrow('ABLY_API_KEY is not defined');
            expect(Ably.Rest).not.toHaveBeenCalled();
        });

        it('should throw an error if ABLY_API_KEY is null', () => {
            process.env.ABLY_API_KEY = null;

            expect(() => getAblyClient()).toThrow('ABLY_API_KEY is not defined');
            expect(Ably.Rest).not.toHaveBeenCalled();
        });

        it('should throw an error if ABLY_API_KEY is undefined', () => {
            process.env.ABLY_API_KEY = undefined;

            expect(() => getAblyClient()).toThrow('ABLY_API_KEY is not defined');
            expect(Ably.Rest).not.toHaveBeenCalled();
        });
    });
});
