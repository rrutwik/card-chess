import * as Sentry from "@sentry/react";

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class LoggerService {
    private formatMessage(message: string, context?: any): string {
        return context ? `${message} ${JSON.stringify(context)}` : message;
    }

    info(message: string, context?: any) {
        console.info(`ℹ️ [INFO] ${this.formatMessage(message, context)}`);
        Sentry.addBreadcrumb({
            category: 'info',
            message: message,
            data: context,
            level: 'info',
        });
    }

    warn(message: string, context?: any) {
        console.warn(`⚠️ [WARN] ${this.formatMessage(message, context)}`);
        Sentry.addBreadcrumb({
            category: 'warn',
            message: message,
            data: context,
            level: 'warning',
        });
    }

    error(message: string, error?: any, context?: any) {
        console.error(`❌ [ERROR] ${message}`, error, context || '');

        Sentry.withScope((scope) => {
            if (context) {
                scope.setExtras(context);
            }
            if (error instanceof Error) {
                Sentry.captureException(error);
            } else {
                Sentry.captureException(new Error(message), {
                    extra: { originalError: error, ...context }
                });
            }
        });
    }

    debug(message: string, context?: any) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`🐛 [DEBUG] ${this.formatMessage(message, context)}`);
        }
        // Debug logs usually don't go to Sentry breadcrumbs to avoid noise, 
        // but can be enabled if needed.
    }
}

export const logger = new LoggerService();
