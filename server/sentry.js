import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';

dotenv.config();

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
    serverName: 'smriti-agent-server',
  });
  console.log('[Sentry] Agent Tracing initialized with full sampling.');
} else {
  console.log('[Sentry] SENTRY_DSN not provided — running local quiet tracing.');
}

/**
 * Wrap any pipeline step with a Sentry tracing span
 * 
 * @param {string} name - Name of the span (e.g. 'mastra.retrieve', 'gemma.synthesize')
 * @param {string} op - Operation type (e.g. 'ai.retrieve', 'ai.generate')
 * @param {Object} attributes - Custom metadata to attach to the span
 * @param {Function} fn - Async task to execute
 */
export async function traceSpan(name, op, attributes, fn) {
  const startTime = Date.now();

  if (SENTRY_DSN) {
    return Sentry.startSpan(
      {
        name,
        op,
        attributes: {
          ...attributes,
          timestamp: new Date().toISOString(),
        },
      },
      async (span) => {
        try {
          const result = await fn();
          span.setAttributes({
            'smriti.duration_ms': Date.now() - startTime,
            'smriti.status': 'success',
          });
          return result;
        } catch (error) {
          span.setAttributes({
            'smriti.status': 'error',
            'smriti.error': error.message,
          });
          Sentry.captureException(error);
          throw error;
        }
      }
    );
  } else {
    // Local tracing logger
    try {
      const result = await fn();
      const elapsed = Date.now() - startTime;
      console.log(`[Trace] ${op}::${name} finished in ${elapsed}ms | attrs:`, JSON.stringify(attributes));
      return result;
    } catch (error) {
      console.error(`[Trace Error] ${op}::${name}:`, error.message);
      throw error;
    }
  }
}

export default Sentry;
