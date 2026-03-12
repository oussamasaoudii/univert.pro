import { getConfig } from '@/lib/config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  websiteId?: string;
  requestId?: string;
  action?: string;
  [key: string]: any;
}

const SENSITIVE_LOG_KEY_PATTERN =
  /(pass(word)?|secret|token|cookie|authorization|api[-_]?key|session|credential|reset)/i;

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function shouldLog(level: LogLevel): boolean {
  try {
    const config = getConfig();
    const configLevel = LOG_LEVELS[config.LOG_LEVEL as LogLevel] || 1;
    return LOG_LEVELS[level] >= configLevel;
  } catch {
    return true;
  }
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function formatLog(level: LogLevel, message: string, context?: LogContext) {
  return {
    timestamp: formatTimestamp(),
    level: level.toUpperCase(),
    service: (() => {
      try {
        return getConfig().LOG_SERVICE;
      } catch {
        return 'app';
      }
    })(),
    message,
    context: context || {},
  };
}

function sanitizeLogValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeLogValue(entry));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const entries = Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
    if (SENSITIVE_LOG_KEY_PATTERN.test(key)) {
      return [key, '[REDACTED]'];
    }

    return [key, sanitizeLogValue(entry)];
  });

  return Object.fromEntries(entries);
}

async function sendToSentry(error: Error, level: LogLevel, context?: LogContext) {
  try {
    // Try to get config, but don't fail if env vars are missing
    let sentryDsn: string | undefined;
    try {
      const config = getConfig();
      sentryDsn = config.SENTRY_DSN;
    } catch {
      // Config not available, check env directly
      sentryDsn = process.env.SENTRY_DSN;
    }
    
    if (!sentryDsn) return;

    // In production, send to Sentry
    if (typeof window === 'undefined') {
      // Server-side
      const Sentry = await import('@sentry/nextjs').catch(() => null);
      if (Sentry) {
        if (level === 'error') {
          Sentry.captureException(error, { extra: context });
        } else if (level === 'warn') {
          Sentry.captureMessage(error.message, 'warning');
        }
      }
    }
  } catch (err) {
    // Silently fail - don't log errors about logging errors
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (!shouldLog('debug')) return;
    console.log(JSON.stringify(formatLog('debug', message, context)));
  },

  info(message: string, context?: LogContext) {
    if (!shouldLog('info')) return;
    console.log(JSON.stringify(formatLog('info', message, context)));
  },

  warn(message: string, context?: LogContext) {
    if (!shouldLog('warn')) return;
    console.warn(JSON.stringify(formatLog('warn', message, context)));
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    if (!shouldLog('error')) return;
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack =
      process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined;
    
    const logContext = {
      ...(sanitizeLogValue(context || {}) as Record<string, unknown>),
      errorMessage,
      errorStack,
    };

    const formatted = formatLog('error', message, logContext);
    console.error(JSON.stringify(formatted));

    if (error instanceof Error) {
      sendToSentry(error, 'error', logContext).catch(() => {});
    }
  },

  async captureException(error: Error, context?: LogContext) {
    this.error(error.message, error, context);
  },
};

/**
 * Production-safe error handling for API routes and server actions
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public context?: LogContext,
  ) {
    super(message);
    this.name = 'AppError';
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: LogContext) {
    super(400, message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: LogContext) {
    super(401, message, 'AUTH_ERROR', context);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission for this action', context?: LogContext) {
    super(403, message, 'PERMISSION_ERROR', context);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, context?: LogContext) {
    super(404, `${resource} not found`, 'NOT_FOUND', context);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: LogContext) {
    super(409, message, 'CONFLICT', context);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', context?: LogContext) {
    super(429, message, 'RATE_LIMIT', context);
    this.name = 'RateLimitError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: LogContext) {
    super(500, message, 'INTERNAL_ERROR', context);
    this.name = 'InternalServerError';
  }
}

/**
 * Handle errors in API routes safely
 */
export function handleApiError(error: unknown, context?: LogContext) {
  if (error instanceof AppError) {
    logger.warn(error.message, {
      ...context,
      code: error.code,
      statusCode: error.statusCode,
    });
    return {
      statusCode: error.statusCode,
      body: error.toJSON(),
    };
  }

  if (error instanceof Error) {
    logger.error('Unhandled error in API route', error, context);
    return {
      statusCode: 500,
      body: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
    };
  }

  logger.error('Unknown error type', new Error(String(error)), context);
  return {
    statusCode: 500,
    body: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}

/**
 * Handle errors in server actions
 */
export function handleActionError(error: unknown, action: string, context?: LogContext) {
  if (error instanceof AppError) {
    logger.warn(`Server action failed: ${action}`, {
      ...context,
      code: error.code,
      statusCode: error.statusCode,
    });
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    logger.error(`Unhandled error in server action: ${action}`, error, context);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      code: 'INTERNAL_ERROR',
    };
  }

  logger.error(`Unknown error in server action: ${action}`, new Error(String(error)), context);
  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
    code: 'INTERNAL_ERROR',
  };
}
