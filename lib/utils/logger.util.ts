/**
 * Server-side Logger Utility for Next.js
 * 
 * Uses console-based logging instead of Winston, which doesn't
 * work well in Next.js serverless/edge environments.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const currentLevel: LogLevel =
  process.env.NODE_ENV === 'development' ? 'debug' : 'warn';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

function formatMessage(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
}

const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('error')) console.error(formatMessage('error', message), ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message), ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) console.log(formatMessage('info', message), ...args);
  },
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) console.log(formatMessage('debug', message), ...args);
  },
};

export default logger;
