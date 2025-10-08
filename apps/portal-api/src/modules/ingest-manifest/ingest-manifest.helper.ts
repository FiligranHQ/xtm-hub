import fs from 'fs';
import path from 'path';
import z from 'zod';
import { ManifestInformation } from './ingest-manifest.model';

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
      return JSON.parse(fileContent);
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

export const extractManifestInformation = (
  jsonData: unknown
): ManifestInformation[] => {
  try {
    // Validate only the fields we need
    const result = ManifestSchema.safeParse(jsonData);

    if (!result.success) {
      // Log detailed validation errors
      const formattedError = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');

      console.error('Manifest validation failed:', formattedError);
      return [];
    }

    // Type-safe mapping - all fields guaranteed to exist
    return result.data.data.contracts.map(
      (contract): ManifestInformation => ({
        version: result.data.data.version,
        name: contract.title,
        description: contract.description,
        shortDescription: contract.short_description,
        containerImage: contract.container_image,
        slug: contract.slug,
        logo: contract.logo,
        verified: contract.verified,
        containerType: contract.container_type,
        useCases: contract.use_cases,
        sourceCode: contract.source_code,
        subscriptionLink: contract.subscription_link,
      })
    );
  } catch (error) {
    console.error(
      'Error extracting manifest info:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return [];
  }
};

const ContractSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  short_description: z.string().min(1),
  logo: z.string().min(1),
  use_cases: z.array(z.string()).min(1), // At least one use case
  verified: z.boolean(),
  container_image: z.string().min(1),
  container_type: z.string().min(1),
  source_code: z.string().url(),
  subscription_link: z.string().url().or(z.literal('')),
});

const ManifestSchema = z.object({
  url: z.string().url(),
  data: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string(),
    version: z.string().min(1),
    contracts: z.array(ContractSchema),
  }),
});
