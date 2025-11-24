import * as Sentry from '@sentry/node';
import { httpIntegration, expressIntegration } from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry(): void {
  // Only initialize Sentry if DSN is provided
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not provided. Error tracking will not be enabled.');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),

    // Profiling sample rate
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),

    // Enable profiling and tracing
    integrations: [nodeProfilingIntegration(), httpIntegration(), expressIntegration()],

    // Configure beforeSend to filter sensitive data
    beforeSend(event) {
      // Filter out sensitive information
      if (event.request) {
        if (event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
        }
        if (event.request.data) {
          // Remove password fields
          if (typeof event.request.data === 'object' && event.request.data !== null) {
            const data = event.request.data as Record<string, unknown>;
            delete data.password;
            delete data.oldPassword;
            delete data.newPassword;
          }
        }
      }
      return event;
    },

    // Ignore certain errors
    ignoreErrors: ['SocketException', 'TimeoutError', 'AbortError', 'CancelledError'],
  });

  console.log('✅ Sentry initialized successfully');
}

export { Sentry };
