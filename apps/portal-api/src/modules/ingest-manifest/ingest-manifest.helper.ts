import fs from 'fs';
import path from 'path';

const CACHE_DIR = '.cache';
const CACHE_OPENCTI_FILE_NAME = 'manifest_octi_connectors.json';
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

export const fetchManifest = async (url: string) => {
  const cachedData = await getFromCache();
  if (cachedData) {
    return cachedData;
  }
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await response.json();
  await storeInCache(url, data);
  return data;
};

const getFromCache = async () => {
  try {
    const filePath = path.join(CACHE_DIR, CACHE_OPENCTI_FILE_NAME);
    if (fs.existsSync(filePath)) {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      const cacheData = JSON.parse(fileContent);
      return cacheData.data;
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
};

// TODO we don't need to keep in cache. Will be removed once the dev is finished
const storeInCache = async (url: string, data: unknown) => {
  try {
    const filePath = path.join(CACHE_DIR, CACHE_OPENCTI_FILE_NAME);

    const cacheData = {
      url,
      timestamp: new Date().toISOString(),
      data,
    };

    await fs.promises.writeFile(filePath, JSON.stringify(cacheData, null, 2));
  } catch (error) {
    console.error('Error storing cache:', error);
  }
};
