import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

// Configure the database connection pool parameters
const poolConfig = {
  host: process.env.SQL_HOST,
  port: Number(process.env.SQL_PORT || 5432),
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
  connectionTimeoutMillis: 15000, // Wait up to 15 seconds to connect
  idleTimeoutMillis: 10000,       // Close idle connections after 10 seconds to avoid stale sockets
  max: 20,                        // Allow up to 20 concurrent connections
  keepAlive: true,                // Enable TCP keepalive to keep connections healthy
  keepAliveInitialDelayMillis: 10000, // Send TCP keepalive after 10 seconds of inactivity
};

// Create a single stable pool instance that will be used by Drizzle
const pool = new Pool(poolConfig);

// Catch and handle idle client errors to prevent unexpected server crashes and avoid health-check alarm false positives
pool.on('error', (err: any) => {
  const message = err?.message || String(err);
  if (message.includes('Connection terminated unexpectedly') || message.includes('connection terminated')) {
    console.warn('[Database Pool] Idle client connection closed or timed out by server (safely discarded by pool):', message);
  } else {
    console.warn('[Database Pool] Idle client connection warning:', message);
  }
});

/**
 * Checks if a database error is transient or connection-related.
 * This includes Cloud SQL cold starts, transient socket terminations, and network timeouts.
 */
const isConnectionError = (err: any): boolean => {
  if (!err) return false;
  
  // Check the error code (Class 57 corresponds to operator intervention/connection termination)
  const code = String(err.code || '');
  if (code.startsWith('57') || code === '08000' || code === '08003' || code === '08006') {
    return true;
  }

  const errMsg = (err.message || '').toLowerCase();
  return (
    errMsg.includes('connection terminated') ||
    errMsg.includes('connection timeout') ||
    errMsg.includes('connection lost') ||
    errMsg.includes('socket') ||
    errMsg.includes('econnrefused') ||
    errMsg.includes('etimedout') ||
    errMsg.includes('unexpected') ||
    errMsg.includes('handshake') ||
    errMsg.includes('broken pipe')
  );
};

/**
 * Calculates exponential backoff with randomized jitter to prevent the "thundering herd" problem.
 * @param attempt The current attempt number (1-indexed)
 */
const getBackoffDelay = (attempt: number): number => {
  const baseDelay = 500; // start with 500ms
  const factor = 1.5;
  const maxDelay = 3000; // cap backoff at 3 seconds
  const delay = baseDelay * Math.pow(factor, attempt - 1);
  const jitter = Math.random() * 200; // add up to 200ms jitter
  return Math.min(delay + jitter, maxDelay);
};

// Wrap pool.query with robust, self-healing retry logic
const originalQuery = pool.query.bind(pool);
// @ts-ignore
pool.query = async function (...args: any[]) {
  let attempts = 0;
  const maxAttempts = 15; // Retries up to 15 times (~35 seconds) to comfortably survive any cold start
  
  while (true) {
    try {
      // @ts-ignore
      return await originalQuery(...args);
    } catch (err: any) {
      attempts++;
      if (isConnectionError(err) && attempts < maxAttempts) {
        const delay = getBackoffDelay(attempts);
        console.log(
          `[Database Query] Auto-refreshing stale connection slot (attempt ${attempts}/${maxAttempts}). ` +
          `Retrying query in ${Math.round(delay)}ms.`
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
};

// Wrap pool.connect with robust, self-healing retry and client protection
const originalConnect = pool.connect.bind(pool);
// @ts-ignore
pool.connect = function (...connectArgs: any[]) {
  const callback = typeof connectArgs[0] === 'function' ? connectArgs[0] : null;

  if (callback) {
    // Call original connect with a custom callback that wraps the client
    return originalConnect((err: any, client: any, done: any) => {
      if (err) {
        callback(err, undefined, done);
        return;
      }
      if (client) {
        let released = false;
        const originalRelease = client.release.bind(client);
        client.release = (destroy?: any) => {
          if (released) return;
          released = true;
          originalRelease(destroy);
        };

        const originalClientQuery = client.query.bind(client);
        // @ts-ignore
        client.query = async function (...clientArgs: any[]) {
          try {
            // @ts-ignore
            return await originalClientQuery(...clientArgs);
          } catch (err: any) {
            if (isConnectionError(err)) {
              console.log(
                `[Database Client] Connection slot closed. Re-establishing connection context.`
              );
              client.release(err);
            }
            throw err;
          }
        };
      }
      callback(err, client, done);
    });
  }

  // Promise-based wrapper
  return (async () => {
    let attempts = 0;
    const maxAttempts = 15;
    
    while (true) {
      try {
        // @ts-ignore
        const client: any = await originalConnect(...connectArgs);
        
        if (!client) {
          throw new Error('Database pool connect returned undefined client');
        }

        // Ensure we only release the client once
        let released = false;
        const originalRelease = client.release.bind(client);
        client.release = (destroy?: any) => {
          if (released) return;
          released = true;
          originalRelease(destroy);
        };

        // Wrap client.query to catch active connection errors and immediately discard the client
        const originalClientQuery = client.query.bind(client);
        // @ts-ignore
        client.query = async function (...clientArgs: any[]) {
          try {
            // @ts-ignore
            return await originalClientQuery(...clientArgs);
          } catch (err: any) {
            if (isConnectionError(err)) {
              console.log(
                `[Database Client] Connection slot closed. Re-establishing connection context.`
              );
              client.release(err); // Pass error to destroy the client connection in the pool
            }
            throw err;
          }
        };

        return client;
      } catch (err: any) {
        attempts++;
        if (isConnectionError(err) && attempts < maxAttempts) {
          const delay = getBackoffDelay(attempts);
          console.log(
            `[Database Connect] Retrying slot connection (attempt ${attempts}/${maxAttempts}). ` +
            `Retrying in ${Math.round(delay)}ms.`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }
  })();
};

// Initialize Drizzle with our resilient, self-healing database client
export const db = drizzle(pool, { schema });
