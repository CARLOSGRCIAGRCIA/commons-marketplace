import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import { getEnvironmentConfig } from '../../config/environment.js';
import logger from '../logger/logger.js';

const loadYamlFile = (filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = yaml.load(content);
        logger.debug('YAML file loaded successfully', { filePath });
        return parsed;
    } catch (error) {
        logger.error('Failed to load YAML file', {
            filePath,
            error: error.message,
        });
        return null;
    }
};

const loadAndMergePathsAndDocsFromDirectory = (dirPath) => {
    const mergedPaths = {};
    const mergedComponents = { schemas: {} };

    try {
        const files = fs.readdirSync(dirPath);
        logger.debug('Loading YAML files from directory', {
            dirPath,
            fileCount: files.length,
        });

        files.forEach((file) => {
            if (file.endsWith('.yaml')) {
                const fullPath = path.join(dirPath, file);
                const yamlContent = loadYamlFile(fullPath);

                if (yamlContent?.paths && typeof yamlContent.paths === 'object') {
                    Object.assign(mergedPaths, yamlContent.paths);
                    logger.debug('Merged paths from file', {
                        file,
                        pathCount: Object.keys(yamlContent.paths).length,
                    });
                }

                if (
                    yamlContent?.components?.schemas &&
                    typeof yamlContent.components.schemas === 'object'
                ) {
                    Object.assign(mergedComponents.schemas, yamlContent.components.schemas);
                    logger.debug('Merged schemas from file', {
                        file,
                        schemaCount: Object.keys(yamlContent.components.schemas).length,
                    });
                }
            }
        });

        logger.info('Successfully loaded and merged all Swagger paths', {
            totalPaths: Object.keys(mergedPaths).length,
            totalSchemas: Object.keys(mergedComponents.schemas).length,
        });
    } catch (error) {
        logger.error('Error loading YAML files from directory', {
            dirPath,
            error: error.message,
        });
    }

    return { mergedPaths, mergedComponents };
};

export const swaggerDocs = (app) => {
    const envConfig = getEnvironmentConfig();

    if (!envConfig.enableSwagger) {
        logger.info('Swagger is disabled in this environment', {
            environment: envConfig.nodeEnv,
        });
        return;
    }

    logger.info('Initializing Swagger documentation', {
        environment: envConfig.nodeEnv,
    });

    const swaggerBasePath = path.resolve('src/infrastructure/swagger/docs/swagger.yaml');
    const swaggerBase = loadYamlFile(swaggerBasePath);

    if (!swaggerBase || typeof swaggerBase !== 'object') {
        logger.error('Failed to load base swagger file', { swaggerBasePath });
        return;
    }

    const pathsDir = path.resolve('src/infrastructure/swagger/docs/paths');
    const { mergedPaths, mergedComponents } = loadAndMergePathsAndDocsFromDirectory(pathsDir);

    swaggerBase.paths = mergedPaths;
    swaggerBase.components = {
        ...(swaggerBase.components || {}),
        schemas: {
            ...(swaggerBase.components?.schemas || {}),
            ...mergedComponents.schemas,
        },
    };

    const servers = [];

    if (envConfig.nodeEnv === 'local') {
        servers.push({
            url: 'http://localhost:3000/api',
            description: 'Local development (Docker)',
        });
        servers.push({
            url: 'http://192.168.1.88:3000/api',
            description: 'Local development (Network)',
        });
    } else if (envConfig.nodeEnv === 'development') {
        servers.push({
            url: `${envConfig.apiUrl}/api`,
            description: 'Development Server',
        });
        servers.push({
            url: 'http://localhost:3000/api',
            description: 'Local testing',
        });
    } else if (envConfig.nodeEnv === 'production') {
        servers.push({
            url: `${envConfig.apiUrl}/api`,
            description: 'Production Server',
        });
    }

    swaggerBase.servers = servers;

    const swaggerUiOptions = {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: `CommonMarketplace API - ${envConfig.nodeEnv.toUpperCase()}`,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
        },
    };

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerBase, swaggerUiOptions));

    const docsUrl =
        envConfig.nodeEnv === 'local'
            ? 'http://localhost:3000/api-docs'
            : `${envConfig.apiUrl}/api-docs`;

    logger.info('Swagger documentation initialized successfully', {
        docsUrl,
        apiUrl: servers[0].url,
        environment: envConfig.nodeEnv,
        pathCount: Object.keys(mergedPaths).length,
        schemaCount: Object.keys(mergedComponents.schemas).length,
    });
};
