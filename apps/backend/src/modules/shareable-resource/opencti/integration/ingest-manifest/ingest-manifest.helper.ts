import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { Readable } from 'stream';
import z from 'zod';
import {
  DocumentSourceType,
  IntegrationSubType,
  IntegrationType,
} from '../../../../../__generated__/resolvers-types';
import { logApp } from '../../../../../utils/app-logger.util';
import { getErrorMessage } from '../../../../../utils/error/error-guard.util';
import { fetchWithCacheForLocalTesting } from '../../../../../utils/fetch-with-cache';
import { isValidVersion } from '../../../../../utils/versioning';
import { Upload } from '../../../../document/document.uploads.helper';
import { useCaseDomain } from '../../../../use-case/use-case.domain';
import {
  INTEGRATION_SERVICE_INSTANCE_ID,
  OPENCTI_INTEGRATION_DOCUMENT_TYPE,
} from '../integration.model';
import { ManifestInformation } from './ingest-manifest.model';

export interface ManifestExtractionResult {
  validContracts: ManifestInformation[];
  errors: {
    contractTitle?: string;
    contractSlug?: string;
    error: string;
  }[];
}

export interface UseCaseValidationWarning {
  contractTitle?: string;
  contractSlug?: string;
  warning: string;
}

export interface InvalidConnectorUseCases {
  contractTitle?: string;
  contractSlug?: string;
  invalidUseCases: string[];
}

const CACHE_OPENCTI_FILE_NAME = 'manifest_octi_connectors.json';

const ContractSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  short_description: z.string().min(1),
  logo: z.string().min(1),
  use_cases: z.array(z.string()), // At least one use case
  verified: z.boolean(),
  container_image: z.string().min(1),
  container_type: z.nativeEnum(IntegrationSubType),
  source_code: z.string().url(),
  subscription_link: z.string().url().or(z.literal('')).nullish(),
  manager_supported: z.boolean(),
  playbook_supported: z.boolean(),
});

const ManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  version: z.string().min(1).refine(isValidVersion),
  contracts: z.array(z.unknown()),
});

// Type for partially valid contract data (used for error reporting)
type PartialContract = {
  title?: string;
  slug?: string;
};

export const IngestManifestHelper = {
  fetchManifest: async (url: string) => {
    return fetchWithCacheForLocalTesting(CACHE_OPENCTI_FILE_NAME, async () => {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });
      return response.json();
    });
  },
  extractManifestInformation: (jsonData: unknown): ManifestExtractionResult => {
    const validContracts: ManifestInformation[] = [];
    const errors: Array<{
      contractTitle?: string;
      contractSlug?: string;
      error: string;
    }> = [];

    try {
      const manifestResult = ManifestSchema.safeParse(jsonData);

      if (!manifestResult.success) {
        const formattedError = manifestResult.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');

        logApp.error('Manifest validation failed:', { formattedError });
        errors.push({ error: `Manifest structure invalid: ${formattedError}` });
        return { validContracts, errors };
      }

      const manifestData = manifestResult.data;

      for (const contract of manifestData.contracts) {
        const contractResult = ContractSchema.safeParse(contract);

        if (!contractResult.success) {
          const formattedError = contractResult.error.issues
            .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
            .join(', ');

          const partialContract = contract as PartialContract;
          const contractIdentifier = {
            contractTitle: partialContract.title ?? 'Unknown',
            contractSlug: partialContract.slug ?? 'Unknown',
          };

          logApp.error(
            `Contract validation failed for ${contractIdentifier.contractTitle} (${contractIdentifier.contractSlug}): ${formattedError}`
          );

          errors.push({
            ...contractIdentifier,
            error: formattedError,
          });

          continue;
        }

        const validContract = contractResult.data;
        validContracts.push({
          /* Document properties */
          name: validContract.title,
          description: validContract.description,
          short_description: validContract.short_description?.slice(0, 250),
          slug: validContract.slug,
          service_instance_id: INTEGRATION_SERVICE_INSTANCE_ID,
          type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
          source_type: DocumentSourceType.External,
          /* Document metadata properties */
          container_image: validContract.container_image,
          product_version: manifestData.version,
          verified: validContract.verified,
          integration_subtype: validContract.container_type,
          integration_type: IntegrationType.Connector,
          source_code: validContract.source_code,
          subscription_link: validContract.subscription_link,
          manager_supported: validContract.manager_supported,
          playbook_supported: validContract.playbook_supported,
          /*Use case and picture*/
          use_cases: validContract.use_cases,
          logo: validContract.logo,
        });
      }

      logApp.info(
        `Processed manifest: ${validContracts.length} valid contracts, ${errors.length} invalid contracts`
      );

      return { validContracts, errors };
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logApp.error(`Error extracting manifest info: ${errorMessage}`);
      errors.push({ error: `Unexpected error: ${errorMessage}` });
      return { validContracts, errors };
    }
  },
  filterUnknownUseCases: async (
    contracts: ManifestInformation[]
  ): Promise<{
    sanitizedContracts: ManifestInformation[];
    warnings: UseCaseValidationWarning[];
    invalidUseCases: string[];
    invalidUseCasesByConnector: InvalidConnectorUseCases[];
  }> => {
    if (!contracts.length) {
      return {
        sanitizedContracts: contracts,
        warnings: [],
        invalidUseCases: [],
        invalidUseCasesByConnector: [],
      };
    }

    const uniqueUseCases = [
      ...new Set(
        contracts.flatMap((contract) =>
          (contract.use_cases ?? []).map((useCase) => useCase.trim())
        )
      ),
    ].filter(Boolean);

    if (!uniqueUseCases.length) {
      return {
        sanitizedContracts: contracts,
        warnings: [],
        invalidUseCases: [],
        invalidUseCasesByConnector: [],
      };
    }

    const knownUseCases = await Promise.all(
      uniqueUseCases.map(async (useCaseName) => {
        const existingUseCase =
          await useCaseDomain.loadUseCaseByLikeName(useCaseName);
        return existingUseCase ? useCaseName.toLowerCase() : null;
      })
    );

    const knownUseCaseNameSet = new Set(
      knownUseCases.filter(
        (useCaseName): useCaseName is string => !!useCaseName
      )
    );

    const warnings: UseCaseValidationWarning[] = [];
    const invalidUseCaseSet = new Set<string>();
    const invalidUseCasesByConnector: InvalidConnectorUseCases[] = [];
    const sanitizedContracts = contracts.map((contract) => {
      const knownContractUseCases: string[] = [];
      const unknownContractUseCases: string[] = [];

      for (const useCaseName of contract.use_cases ?? []) {
        const normalizedUseCaseName = useCaseName.trim();
        if (!normalizedUseCaseName) {
          continue;
        }

        if (knownUseCaseNameSet.has(normalizedUseCaseName.toLowerCase())) {
          knownContractUseCases.push(normalizedUseCaseName);
          continue;
        }

        unknownContractUseCases.push(normalizedUseCaseName);
        invalidUseCaseSet.add(normalizedUseCaseName);
      }

      if (unknownContractUseCases.length > 0) {
        warnings.push({
          contractTitle: contract.name ?? undefined,
          contractSlug: contract.slug ?? undefined,
          warning: `Unknown use case(s) skipped: ${unknownContractUseCases.join(', ')}`,
        });

        invalidUseCasesByConnector.push({
          contractTitle: contract.name ?? undefined,
          contractSlug: contract.slug ?? undefined,
          invalidUseCases: unknownContractUseCases,
        });
      }

      return {
        ...contract,
        use_cases: knownContractUseCases,
      };
    });

    return {
      sanitizedContracts,
      warnings,
      invalidUseCases: [...invalidUseCaseSet],
      invalidUseCasesByConnector,
    };
  },
  base64ToUpload: (
    base64String: string,
    filename: string = 'image.png'
  ): Upload => {
    // Remove data URL prefix if present
    const base64Data = base64String.replace(/^data:.*?;base64,/, '');

    // Extract MIME type
    const mimeMatch = base64String.match(/^data:(.*?);base64,/);
    const mimetype = mimeMatch?.[1] ?? 'image/png';

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
  },
};
