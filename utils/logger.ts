import winston from 'winston';
import path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');
const logLevel = process.env.LOG_LEVEL ?? 'info';

// Custom format for console (colorized)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level}] ${message}`;
  }),
);

// Custom format for file (plain text)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }),
);

const logger = winston.createLogger({
  level: logLevel,
  transports: [
    // Console transport — colorized
    new winston.transports.Console({ format: consoleFormat }),

    // All logs → test-execution.log
    new winston.transports.File({
      filename: path.join(logDir, 'test-execution.log'),
      format: fileFormat,
    }),

    // Error-only logs → error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
    }),

    // Debug-level and above → debug.log
    new winston.transports.File({
      filename: path.join(logDir, 'debug.log'),
      level: 'debug',
      format: fileFormat,
    }),
  ],
});

// ──────────────────────────────────────────────
// Convenience helpers for structured test logging
// ──────────────────────────────────────────────

/** Log a numbered test step */
function step(message: string): void {
  logger.info(`📌 STEP: ${message}`);
}

/** Log the start of a test */
function testStart(testName: string): void {
  logger.info(`▶️  TEST START: ${testName} — ${new Date().toISOString()}`);
}

/** Log the end of a test with status and duration */
function testEnd(testName: string, status: string, durationMs: number): void {
  const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
  logger.info(
    `${icon} TEST END: ${testName} — ${status.toUpperCase()} (${durationMs}ms) — ${new Date().toISOString()}`,
  );
}

export { logger, step, testStart, testEnd };
