// config/db.js
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { MONGO_URI } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error ${error}`);
    process.exit(1);
  }
};

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed through app termination');
  process.exit(0);
});
