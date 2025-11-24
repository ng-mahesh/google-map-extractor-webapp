import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
    const contextStr = context ? `[${context}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
  }),
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export const winstonConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Application log file
    new winston.transports.File({
      filename: path.join(logDir, 'application.log'),
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
};
