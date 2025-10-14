import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { Readable } from 'stream';
import z from 'zod';
import { logApp } from '../../utils/app-logger.util';
import { fetchWithCacheForLocalTesting } from '../../utils/fetch-with-cache';
import { Upload } from '../services/document/document.helper';
import {
  INTEGRATION_FEED_CONNECTORS_TYPE,
  INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
} from '../services/integration-feeds/integration-feeds.model';
import { ManifestInformation } from './ingest-manifest.model';

const CACHE_OPENCTI_FILE_NAME = 'manifest_octi_connectors.json';

export const fetchManifest = async (url: string) => {
  return fetchWithCacheForLocalTesting(CACHE_OPENCTI_FILE_NAME, async () => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return response.json();
  });
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
    return result.data.contracts.map(
      (contract): ManifestInformation => ({
        /* Document properties */
        name: contract.title,
        description: contract.description,
        short_description: contract.short_description?.slice(0, 250),
        slug: contract.slug,
        service_instance_id: INTEGRATION_FEEDS_SERVICE_INSTANCE_ID,
        type: OPENCTI_INTEGRATION_FEED_DOCUMENT_TYPE,
        source_type: 'external',
        /* Document metadata properties */
        container_image: contract.container_image,
        product_version: result.data.version,
        verified: contract.verified,
        integration_subtype: contract.container_type,
        integration_type: INTEGRATION_FEED_CONNECTORS_TYPE,
        source_code: contract.source_code,
        subscription_link: contract.subscription_link,
        manager_supported: contract.manager_supported,
        playbook_supported: contract.playbook_supported,
        /*Label and picture*/
        labels: contract.use_cases,
        logo: contract.logo,
      })
    );
  } catch (error) {
    logApp.error(`Error extracting manifest info: ${error.message}`);
    return [];
  }
};

const ContractSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  short_description: z.string().min(1),
  logo: z.string().min(1),
  use_cases: z.array(z.string()), // At least one use case
  verified: z.boolean(),
  container_image: z.string().min(1),
  container_type: z.string().min(1),
  source_code: z.string().url(),
  subscription_link: z.string().url().or(z.literal('')),
  manager_supported: z.boolean(),
  playbook_supported: z.boolean(),
});

const ManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  version: z.string().min(1),
  contracts: z.array(ContractSchema),
});

export const base64ToUpload = (
  base64String: string,
  filename: string = 'image.png'
): Upload => {
  // Remove data URL prefix if present
  const base64Data = base64String.replace(/^data:.*?;base64,/, '');

  // Extract MIME type
  const mimeMatch = base64String.match(/^data:(.*?);base64,/);
  const mimetype = mimeMatch ? mimeMatch[1] : 'image/png';

  // Convert to Buffer
  const buffer = Buffer.from(base64Data, 'base64');

  // Create the FileUpload object
  const fileUpload: FileUpload = {
    filename,
    mimetype,
    encoding: '7bit',
    createReadStream: () => Readable.from(buffer),
  };

  // Create the promise that resolves to the same FileUpload
  const promise = Promise.resolve(fileUpload);

  return {
    file: fileUpload,
    promise,
  };
};
