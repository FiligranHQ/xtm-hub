import config from 'config';
import fs from 'fs';
import path from 'path';
import { logApp } from './app-logger.util';

const CACHE_DIR = '.cache';
// Cache wrapper that takes a fetch function and cache key
export const fetchWithCacheForLocalTesting = async <T>(
  cacheFileName: string,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const isLocal = config.get('environment') === 'local';

  // Only use cache in local environment
  if (isLocal) {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR);
    }
    const cachedData = await getFromCache(cacheFileName);
    if (cachedData) {
      return cachedData;
    }
  }

  const data = await fetchFn();

  // Only store in cache in local environment
  if (isLocal) {
    await storeInCache(cacheFileName, data);
  }

  return data;
};

// Updated cache helpers to use the cache key parameter
const getFromCache = async (cacheFileName: string) => {
  try {
    const filePath = path.join(CACHE_DIR, cacheFileName);
    if (fs.existsSync(filePath)) {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(fileContent); // Return just the data, not the whole cache object
    }
  } catch (error) {
    logApp.error('Error reading cache:', { error });
  }
  return null;
};

const storeInCache = async (cacheFileName: string, data: unknown) => {
  try {
    const filePath = path.join(CACHE_DIR, cacheFileName);
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error storing cache:', error);
  }
};
