import pino, { Logger, LoggerOptions } from 'pino';

// Default options
const defaultOptions: LoggerOptions = {
  level: "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  }
};

// Singleton logger instance
let logger: Logger = pino(
  defaultOptions,
  pino.transport({
    target: "@jvddavid/pino-rotating-file",
    options: {
      path: "./logs",
      pattern: "log-%Y-%M-%d-%N.log",
      maxSize: 1024 * 1024 * 10,
      sync: false,
      fsync: false,
      append: true,
      mkdir: true
    }
  })
);

// Initialize or reconfigure logger
export function configureLogger(options?: LoggerOptions | pino.DestinationStream): Logger {
logger = pino({ ...defaultOptions, ...options });
return logger;
}

// Get current logger instance
export function getLogger(): Logger {
return logger;
}

// Shortcut logging methods
export const log = {
  trace: (msg: string, ...args: any[]) => logger.trace(msg, ...args),
  debug: (msg: string, ...args: any[]) => logger.debug(msg, ...args),
  info: (msg: string, ...args: any[]) => logger.info(msg, ...args),
  warn: (msg: string, ...args: any[]) => logger.warn(msg, ...args),
  error: (msg: string, ...args: any[]) => logger.error(msg, ...args),
  fatal: (msg: string, ...args: any[]) => logger.fatal(msg, ...args)
};

// Create child logger (supports context)
export function createChildLogger(context: Record<string, any>): Logger {
return logger.child(context);
}