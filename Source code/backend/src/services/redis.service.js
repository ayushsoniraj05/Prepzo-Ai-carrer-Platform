import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const hasRedisUrl = !!process.env.REDIS_URL;

const redisClient = hasRedisUrl
  ? createClient({ url: process.env.REDIS_URL })
  : null;

if (redisClient) {
  // Only attach listeners if Redis is configured
  redisClient.on('error', () => {
    // Silently ignore Redis errors - app works fine without it
  });

  redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

  (async () => {
    try {
      await redisClient.connect();
    } catch (err) {
      console.warn('⚠️ Redis connection failed. Using in-memory fallback.');
    }
  })();
} else {
  console.log('ℹ️ Redis not configured. Using in-memory fallback.');
}

/**
 * Cache data with TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to store
 * @param {number} ttl - Time to live in seconds
 */
export const setCache = async (key, value, ttl = 3600) => {
  if (!redisClient || !redisClient.isReady) return null;
  try {
    const stringValue = JSON.stringify(value);
    await redisClient.setEx(key, ttl, stringValue);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get cached data
 * @param {string} key - Cache key
 */
export const getCache = async (key) => {
  if (!redisClient || !redisClient.isReady) return null;
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Delete cached data
 * @param {string} key - Cache key
 */
export const deleteCache = async (key) => {
  if (!redisClient || !redisClient.isReady) return null;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    return false;
  }
};

export default {
  redisClient,
  setCache,
  getCache,
  deleteCache,
};
