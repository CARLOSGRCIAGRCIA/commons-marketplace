import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { log } from '../logger/logger.js';

dotenv.config();

const URL = process.env.DB_URL;

if (!URL) {
    const errorMsg = 'Database URL not found in environment variables';
    log.error('Database configuration error', { error: errorMsg });
    throw new Error(errorMsg);
}

const connectDB = async () => {
    try {
        log.info('Attempting to connect to MongoDB', {
            host: URL.includes('@') ? URL.split('@')[1].split('/')[0] : 'localhost',
        });

        const connection = await mongoose.connect(URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        log.info('MongoDB connected successfully', {
            host: connection.connection.host,
            name: connection.connection.name,
        });

        return true;
    } catch (error) {
        log.error('Error connecting to MongoDB', {
            error: error.message,
            stack: error.stack,
        });
        return false;
    }
};

export default connectDB;
