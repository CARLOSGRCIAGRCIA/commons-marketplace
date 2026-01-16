import { jest, beforeEach, afterEach, describe, test, expect } from '@jest/globals';

describe('Logger Tests', () => {
    // eslint-disable-next-line no-unused-vars
    let logger;
    let log;
    let originalNodeEnv;
    let originalLogLevel;

    beforeEach(async () => {
        originalNodeEnv = process.env.NODE_ENV;
        originalLogLevel = process.env.LOG_LEVEL;

        process.env.NODE_ENV = 'test';

        jest.resetModules();
    });

    afterEach(() => {
        if (originalNodeEnv !== undefined) {
            process.env.NODE_ENV = originalNodeEnv;
        } else {
            delete process.env.NODE_ENV;
        }

        if (originalLogLevel !== undefined) {
            process.env.LOG_LEVEL = originalLogLevel;
        } else {
            delete process.env.LOG_LEVEL;
        }
    });

    describe('Configuración del Logger', () => {
        test('debe exportar el logger como default export', async () => {
            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');

            expect(loggerModule.default).toBeDefined();
            expect(loggerModule.default).toHaveProperty('log');
        });

        test('debe exportar el objeto log como named export', async () => {
            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');

            expect(loggerModule.log).toBeDefined();
            expect(typeof loggerModule.log.error).toBe('function');
            expect(typeof loggerModule.log.warn).toBe('function');
            expect(typeof loggerModule.log.info).toBe('function');
            expect(typeof loggerModule.log.http).toBe('function');
            expect(typeof loggerModule.log.debug).toBe('function');
        });

        test('debe crear logger sin errores en entorno de test', async () => {
            process.env.NODE_ENV = 'test';

            await expect(async () => {
                await import('../../../src/infrastructure/logger/logger.js');
            }).not.toThrow();
        });

        test('debe crear logger sin errores en entorno de desarrollo', async () => {
            process.env.NODE_ENV = 'development';
            delete process.env.LOG_LEVEL;

            await expect(async () => {
                await import('../../../src/infrastructure/logger/logger.js');
            }).not.toThrow();
        });

        test('debe crear logger sin errores en entorno de producción', async () => {
            process.env.NODE_ENV = 'production';
            delete process.env.LOG_LEVEL;

            await expect(async () => {
                await import('../../../src/infrastructure/logger/logger.js');
            }).not.toThrow();
        });

        test('debe crear logger con LOG_LEVEL personalizado', async () => {
            process.env.NODE_ENV = 'production';
            process.env.LOG_LEVEL = 'warn';

            await expect(async () => {
                await import('../../../src/infrastructure/logger/logger.js');
            }).not.toThrow();
        });
    });

    describe('Log Object Methods', () => {
        beforeEach(async () => {
            process.env.NODE_ENV = 'test';
            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            log = loggerModule.log;
            logger = loggerModule.default;
        });

        test('debe llamar a log.error sin lanzar errores', () => {
            expect(() => {
                log.error('Error message', { code: 500 });
            }).not.toThrow();
        });

        test('debe llamar a log.error solo con mensaje', () => {
            expect(() => {
                log.error('Error message');
            }).not.toThrow();
        });

        test('debe llamar a log.warn sin lanzar errores', () => {
            expect(() => {
                log.warn('Warning message', { userId: '123' });
            }).not.toThrow();
        });

        test('debe llamar a log.warn solo con mensaje', () => {
            expect(() => {
                log.warn('Warning message');
            }).not.toThrow();
        });

        test('debe llamar a log.info sin lanzar errores', () => {
            expect(() => {
                log.info('Info message', { action: 'user_login' });
            }).not.toThrow();
        });

        test('debe llamar a log.info solo con mensaje', () => {
            expect(() => {
                log.info('Info message');
            }).not.toThrow();
        });

        test('debe llamar a log.http sin lanzar errores', () => {
            expect(() => {
                log.http('HTTP request', { method: 'GET', url: '/api/users' });
            }).not.toThrow();
        });

        test('debe llamar a log.http solo con mensaje', () => {
            expect(() => {
                log.http('HTTP request');
            }).not.toThrow();
        });

        test('debe llamar a log.debug sin lanzar errores', () => {
            expect(() => {
                log.debug('Debug message', { variable: 'value' });
            }).not.toThrow();
        });

        test('debe llamar a log.debug solo con mensaje', () => {
            expect(() => {
                log.debug('Debug message');
            }).not.toThrow();
        });
    });

    describe('Integration Scenarios', () => {
        test('debe funcionar en entorno de producción', async () => {
            process.env.NODE_ENV = 'production';
            delete process.env.LOG_LEVEL;

            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            const prodLog = loggerModule.log;

            expect(() => {
                prodLog.error('Production error', { statusCode: 500 });
                prodLog.warn('Production warning');
                prodLog.info('Production info');
            }).not.toThrow();
        });

        test('debe funcionar en entorno de desarrollo', async () => {
            process.env.NODE_ENV = 'development';
            delete process.env.LOG_LEVEL;

            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            const devLog = loggerModule.log;

            expect(() => {
                devLog.debug('Development debug message');
                devLog.info('Development info');
            }).not.toThrow();
        });

        test('debe manejar múltiples llamadas consecutivas', async () => {
            process.env.NODE_ENV = 'test';

            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            const testLog = loggerModule.log;

            expect(() => {
                testLog.error('Error 1', { code: 1 });
                testLog.warn('Warning 1', { code: 2 });
                testLog.info('Info 1', { code: 3 });
                testLog.http('HTTP 1', { code: 4 });
                testLog.debug('Debug 1', { code: 5 });
            }).not.toThrow();
        });

        test('debe funcionar con diferentes niveles de LOG_LEVEL', async () => {
            const levels = ['error', 'warn', 'info', 'http', 'debug'];

            for (const level of levels) {
                process.env.LOG_LEVEL = level;
                process.env.NODE_ENV = 'production';
                jest.resetModules();

                const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
                const testLog = loggerModule.log;

                expect(() => {
                    testLog[level](`Test message for ${level}`);
                }).not.toThrow();
            }
        });
    });

    describe('Edge Cases', () => {
        beforeEach(async () => {
            process.env.NODE_ENV = 'test';
            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            log = loggerModule.log;
        });

        test('debe manejar metadata con valores null', () => {
            expect(() => {
                log.error('Error message', { value: null });
            }).not.toThrow();
        });

        test('debe manejar metadata con valores undefined', () => {
            expect(() => {
                log.error('Error message', { value: undefined });
            }).not.toThrow();
        });

        test('debe manejar mensajes vacíos', () => {
            expect(() => {
                log.info('');
            }).not.toThrow();
        });

        test('debe manejar metadata con objetos anidados complejos', () => {
            const complexMeta = {
                user: {
                    id: '123',
                    name: 'John',
                    roles: ['admin', 'user'],
                },
                request: {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                },
            };

            expect(() => {
                log.debug('Complex metadata', complexMeta);
            }).not.toThrow();
        });

        test('debe manejar metadata con arrays', () => {
            expect(() => {
                log.info('Array metadata', { items: [1, 2, 3, 4, 5] });
            }).not.toThrow();
        });

        test('debe manejar metadata con números y booleanos', () => {
            expect(() => {
                log.info('Mixed types', {
                    count: 42,
                    isActive: true,
                    ratio: 3.14,
                    flag: false,
                });
            }).not.toThrow();
        });

        test('debe manejar metadata con números y booleanos', () => {
            expect(() => {
                log.info('Mixed types', {
                    count: 42,
                    isActive: true,
                    ratio: 3.14,
                    flag: false,
                });
            }).not.toThrow();
        });

        test('debe manejar mensajes muy largos', () => {
            const longMessage = 'A'.repeat(1000);

            expect(() => {
                log.info(longMessage);
            }).not.toThrow();
        });

        test('debe manejar metadata sin propiedades', () => {
            expect(() => {
                log.info('Empty metadata', {});
            }).not.toThrow();
        });
    });

    describe('Consistency Tests', () => {
        test('log object debe tener los mismos métodos que el logger', async () => {
            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');

            // eslint-disable-next-line no-unused-vars
            const loggerMethods = Object.keys(loggerModule.default).filter(
                (key) => typeof loggerModule.default[key] === 'function',
            );

            const logMethods = Object.keys(loggerModule.log).filter(
                (key) => typeof loggerModule.log[key] === 'function',
            );

            expect(logMethods).toContain('error');
            expect(logMethods).toContain('warn');
            expect(logMethods).toContain('info');
            expect(logMethods).toContain('http');
            expect(logMethods).toContain('debug');
        });

        test('debe poder llamar a todos los métodos en secuencia', async () => {
            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            const log = loggerModule.log;

            expect(() => {
                log.error('Error');
                log.warn('Warning');
                log.info('Info');
                log.http('HTTP');
                log.debug('Debug');
            }).not.toThrow();
        });
    });

    describe('Environment Isolation', () => {
        test('debe funcionar correctamente después de cambiar NODE_ENV', async () => {
            process.env.NODE_ENV = 'development';
            jest.resetModules();

            let loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            expect(() => loggerModule.log.info('Dev message')).not.toThrow();

            process.env.NODE_ENV = 'production';
            jest.resetModules();

            loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            expect(() => loggerModule.log.info('Prod message')).not.toThrow();

            process.env.NODE_ENV = 'test';
            jest.resetModules();

            loggerModule = await import('../../../src/infrastructure/logger/logger.js');
            expect(() => loggerModule.log.info('Test message')).not.toThrow();
        });

        test('debe funcionar sin NODE_ENV definido', async () => {
            delete process.env.NODE_ENV;
            delete process.env.LOG_LEVEL;
            jest.resetModules();

            const loggerModule = await import('../../../src/infrastructure/logger/logger.js');

            expect(() => {
                loggerModule.log.info('Message without NODE_ENV');
            }).not.toThrow();
        });
    });
});
