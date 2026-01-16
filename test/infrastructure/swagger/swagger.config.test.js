import fs from 'fs';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocs } from '../../../src/infrastructure/swagger/swagger.config.js';
import { getEnvironmentConfig } from '../../../src/config/environment.js';
import logger from '../../../src/infrastructure/logger/logger.js';

jest.mock('fs');
jest.mock('js-yaml');
jest.mock('swagger-ui-express');
jest.mock('../../../src/config/environment.js');
jest.mock('../../../src/infrastructure/logger/logger.js', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
}));

describe('Swagger Configuration', () => {
    let mockApp;

    beforeEach(() => {
        jest.clearAllMocks();

        mockApp = {
            use: jest.fn(),
        };

        swaggerUi.serve = 'swagger-serve-middleware';
        swaggerUi.setup = jest.fn().mockReturnValue('swagger-setup-middleware');
    });

    describe('swaggerDocs - when Swagger is disabled', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: false,
                nodeEnv: 'production',
            });
        });

        it('should not initialize Swagger when disabled', () => {
            swaggerDocs(mockApp);

            expect(logger.info).toHaveBeenCalledWith('Swagger is disabled in this environment', {
                environment: 'production',
            });
            expect(mockApp.use).not.toHaveBeenCalled();
        });
    });

    describe('swaggerDocs - when base swagger file fails to load', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'development',
                apiUrl: 'https://api.example.com',
            });

            fs.readFileSync.mockImplementation(() => {
                throw new Error('File not found');
            });
        });

        it('should log error and return early if base swagger file fails', () => {
            swaggerDocs(mockApp);

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load YAML file',
                expect.objectContaining({
                    error: 'File not found',
                }),
            );
            expect(mockApp.use).not.toHaveBeenCalled();
        });

        it('should return early if swagger base is null', () => {
            fs.readFileSync.mockReturnValue('valid yaml');
            yaml.load.mockReturnValue(null);

            swaggerDocs(mockApp);

            expect(logger.error).toHaveBeenCalledWith(
                'Failed to load base swagger file',
                expect.any(Object),
            );
            expect(mockApp.use).not.toHaveBeenCalled();
        });
    });

    describe('swaggerDocs - successful initialization in local environment', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'local',
                apiUrl: 'http://localhost:3000',
            });

            fs.readFileSync.mockReturnValue('openapi: 3.0.0');
            yaml.load.mockReturnValue({
                openapi: '3.0.0',
                info: { title: 'API' },
                components: { schemas: { User: {} } },
            });

            fs.readdirSync.mockReturnValue(['endpoint1.yaml', 'endpoint2.yaml', 'ignored.txt']);
        });

        it('should initialize Swagger with local servers', () => {
            swaggerDocs(mockApp);

            expect(logger.info).toHaveBeenCalledWith('Initializing Swagger documentation', {
                environment: 'local',
            });

            expect(mockApp.use).toHaveBeenCalledWith(
                '/api-docs',
                'swagger-serve-middleware',
                'swagger-setup-middleware',
            );

            const setupCall = swaggerUi.setup.mock.calls[0];
            const swaggerConfig = setupCall[0];

            expect(swaggerConfig.servers).toEqual([
                {
                    url: 'http://localhost:3000/api',
                    description: 'Local development (Docker)',
                },
                {
                    url: 'http://192.168.1.88:3000/api',
                    description: 'Local development (Network)',
                },
            ]);
        });
    });

    describe('swaggerDocs - successful initialization in development environment', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'development',
                apiUrl: 'https://api-dev.example.com',
            });

            fs.readFileSync.mockReturnValue('openapi: 3.0.0');
            yaml.load.mockReturnValue({
                openapi: '3.0.0',
                info: { title: 'API' },
            });

            fs.readdirSync.mockReturnValue([]);
        });

        it('should initialize Swagger with development servers', () => {
            swaggerDocs(mockApp);

            const setupCall = swaggerUi.setup.mock.calls[0];
            const swaggerConfig = setupCall[0];

            expect(swaggerConfig.servers).toEqual([
                {
                    url: 'https://api-dev.example.com/api',
                    description: 'Development Server',
                },
                {
                    url: 'http://localhost:3000/api',
                    description: 'Local testing',
                },
            ]);
        });
    });

    describe('swaggerDocs - successful initialization in production environment', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'production',
                apiUrl: 'https://api.example.com',
            });

            fs.readFileSync.mockReturnValue('openapi: 3.0.0');
            yaml.load.mockReturnValue({
                openapi: '3.0.0',
                info: { title: 'API' },
            });

            fs.readdirSync.mockReturnValue([]);
        });

        it('should initialize Swagger with production server only', () => {
            swaggerDocs(mockApp);

            const setupCall = swaggerUi.setup.mock.calls[0];
            const swaggerConfig = setupCall[0];

            expect(swaggerConfig.servers).toEqual([
                {
                    url: 'https://api.example.com/api',
                    description: 'Production Server',
                },
            ]);
        });
    });

    describe('swaggerDocs - merging paths and schemas', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'local',
                apiUrl: 'http://localhost:3000',
            });

            fs.readFileSync.mockReturnValueOnce('openapi: 3.0.0');
            yaml.load.mockReturnValueOnce({
                openapi: '3.0.0',
                info: { title: 'API' },
                components: { schemas: { BaseSchema: {} } },
            });

            fs.readdirSync.mockReturnValue(['users.yaml', 'products.yaml']);
        });

        it('should merge paths and schemas from multiple YAML files', () => {
            fs.readFileSync.mockReturnValueOnce('paths: /users');
            yaml.load.mockReturnValueOnce({
                paths: {
                    '/users': { get: { summary: 'Get users' } },
                },
                components: {
                    schemas: { User: { type: 'object' } },
                },
            });

            fs.readFileSync.mockReturnValueOnce('paths: /products');
            yaml.load.mockReturnValueOnce({
                paths: {
                    '/products': { get: { summary: 'Get products' } },
                },
                components: {
                    schemas: { Product: { type: 'object' } },
                },
            });

            swaggerDocs(mockApp);

            const setupCall = swaggerUi.setup.mock.calls[0];
            const swaggerConfig = setupCall[0];

            expect(swaggerConfig.paths).toEqual({
                '/users': { get: { summary: 'Get users' } },
                '/products': { get: { summary: 'Get products' } },
            });

            expect(swaggerConfig.components.schemas).toEqual({
                BaseSchema: {},
                User: { type: 'object' },
                Product: { type: 'object' },
            });

            expect(logger.debug).toHaveBeenCalledWith('Merged paths from file', expect.any(Object));
        });

        it('should handle YAML files without paths or components', () => {
            fs.readFileSync.mockReturnValue('invalid: content');
            yaml.load.mockReturnValue({ invalid: 'content' });

            swaggerDocs(mockApp);

            expect(logger.info).toHaveBeenCalledWith(
                'Successfully loaded and merged all Swagger paths',
                expect.objectContaining({
                    totalPaths: 0,
                    totalSchemas: 0,
                }),
            );
        });

        it('should skip non-YAML files', () => {
            fs.readdirSync.mockReturnValue(['valid.yaml', 'readme.md', 'config.json']);

            fs.readFileSync.mockReturnValue('paths: /test');
            yaml.load.mockReturnValue({
                paths: { '/test': {} },
            });

            swaggerDocs(mockApp);

            expect(fs.readFileSync).toHaveBeenCalledTimes(2);
        });
    });

    describe('swaggerDocs - error handling in directory loading', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'local',
                apiUrl: 'http://localhost:3000',
            });

            fs.readFileSync.mockReturnValueOnce('openapi: 3.0.0');
            yaml.load.mockReturnValueOnce({
                openapi: '3.0.0',
                info: { title: 'API' },
            });
        });

        it('should handle errors when reading directory', () => {
            fs.readdirSync.mockImplementation(() => {
                throw new Error('Permission denied');
            });

            swaggerDocs(mockApp);

            expect(logger.error).toHaveBeenCalledWith(
                'Error loading YAML files from directory',
                expect.objectContaining({
                    error: 'Permission denied',
                }),
            );

            expect(mockApp.use).toHaveBeenCalled();
        });
    });

    describe('swaggerDocs - Swagger UI options', () => {
        beforeEach(() => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'development',
                apiUrl: 'https://api-dev.example.com',
            });

            fs.readFileSync.mockReturnValue('openapi: 3.0.0');
            yaml.load.mockReturnValue({
                openapi: '3.0.0',
                info: { title: 'API' },
            });

            fs.readdirSync.mockReturnValue([]);
        });

        it('should configure Swagger UI options correctly', () => {
            swaggerDocs(mockApp);

            const setupCall = swaggerUi.setup.mock.calls[0];
            const options = setupCall[1];

            expect(options.customCss).toBe('.swagger-ui .topbar { display: none }');
            expect(options.customSiteTitle).toBe('CommonMarketplace API - DEVELOPMENT');
            expect(options.swaggerOptions).toEqual({
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                tryItOutEnabled: true,
            });
        });

        it('should log success with correct documentation URL for local', () => {
            getEnvironmentConfig.mockReturnValue({
                enableSwagger: true,
                nodeEnv: 'local',
                apiUrl: 'http://localhost:3000',
            });

            swaggerDocs(mockApp);

            expect(logger.info).toHaveBeenCalledWith(
                'Swagger documentation initialized successfully',
                expect.objectContaining({
                    docsUrl: 'http://localhost:3000/api-docs',
                }),
            );
        });

        it('should log success with correct documentation URL for non-local', () => {
            swaggerDocs(mockApp);

            expect(logger.info).toHaveBeenCalledWith(
                'Swagger documentation initialized successfully',
                expect.objectContaining({
                    docsUrl: 'https://api-dev.example.com/api-docs',
                }),
            );
        });
    });
});
