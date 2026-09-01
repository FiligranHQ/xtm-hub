import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import {
  DocumentMetadataKeyCode,
  FilterKey,
  LogicalOperator,
} from '../../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import { objectSolutionCategoryDomain } from '../../solution-category/object-solution-category/object-solution-category.domain';
import { solutionCategoryDomain } from '../../solution-category/solution-category.domain';
import { objectUseCaseDomain } from '../../use-case/object-use-case/object-use-case.domain';
import { useCaseDomain } from '../../use-case/use-case.domain';
import { FacetDomain } from './facet.domain';

const OPENCTI_INTEGRATION_DOCUMENT_TYPE = 'opencti_integration';
const INTEGRATION_CONNECTOR_VALUE = 'connector';
const INTEGRATION_CSV_FEED_VALUE = 'csv_feed';
const VERIFIED_TRUE_VALUE = 'true';
const VERIFIED_FALSE_VALUE = 'false';
const ENTITY_TYPE_MALWARE = 'Malware';
const ENTITY_TYPE_THREAT_ACTOR = 'Threat-Actor';

describe('facet.domain', () => {
  const createdDocumentIds: string[] = [];
  const createdServiceInstanceIds: string[] = [];
  const createdUseCaseIds: string[] = [];
  const createdSolutionCategoryIds: string[] = [];

  afterEach(async () => {
    await TestHelper.objectUseCase.delete({});
    await TestHelper.objectSolutionCategory.delete({});
    await TestHelper.documentMetadata.delete({});
    await TestHelper.documentChildren.delete({});
    await TestHelper.document.delete({});
    await TestHelper.useCase.delete({});
    for (const solutionCategoryId of createdSolutionCategoryIds.splice(0)) {
      await solutionCategoryDomain.deleteSolutionCategory({
        id: solutionCategoryId,
      });
    }
    for (const serviceInstanceId of createdServiceInstanceIds.splice(0)) {
      await TestHelper.serviceInstance.delete({
        id: serviceInstanceId as ServiceInstanceId,
      });
    }
    createdDocumentIds.splice(0);
    createdUseCaseIds.splice(0);
  });

  it('should load scoped facet buckets when logical filters are applied', async () => {
    // Given
    const serviceInstance = await TestHelper.serviceInstance.create({
      name: `facet-service-instance-${uuidv4()}`,
      public: true,
    });
    createdServiceInstanceIds.push(serviceInstance.id);

    const connectorTrueDocument = await TestHelper.document.create({
      name: `facet-connector-true-${uuidv4()}`,
      slug: `facet-connector-true-${uuidv4()}`,
      type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      active: true,
      service_instance_id: serviceInstance.id,
    });
    const csvTrueDocument = await TestHelper.document.create({
      name: `facet-csv-true-${uuidv4()}`,
      slug: `facet-csv-true-${uuidv4()}`,
      type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      active: true,
      service_instance_id: serviceInstance.id,
    });
    const connectorFalseDocument = await TestHelper.document.create({
      name: `facet-connector-false-${uuidv4()}`,
      slug: `facet-connector-false-${uuidv4()}`,
      type: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      active: true,
      service_instance_id: serviceInstance.id,
    });
    createdDocumentIds.push(
      connectorTrueDocument.id,
      csvTrueDocument.id,
      connectorFalseDocument.id
    );

    const [incidentUseCase, threatHuntingUseCase] = await Promise.all([
      useCaseDomain.insertUseCase({
        name: `facet-use-case-incident-${uuidv4()}`,
        color: '#000000',
      }),
      useCaseDomain.insertUseCase({
        name: `facet-use-case-threat-${uuidv4()}`,
        color: '#ffffff',
      }),
    ]);
    createdUseCaseIds.push(incidentUseCase.id, threatHuntingUseCase.id);

    const [edrSolutionCategory, siemSolutionCategory] = await Promise.all([
      solutionCategoryDomain.insertSolutionCategory({
        name: `facet-solution-category-edr-${uuidv4()}`,
      }),
      solutionCategoryDomain.insertSolutionCategory({
        name: `facet-solution-category-siem-${uuidv4()}`,
      }),
    ]);
    createdSolutionCategoryIds.push(
      edrSolutionCategory.id,
      siemSolutionCategory.id
    );

    await Promise.all([
      TestHelper.documentMetadata.create({
        document_id: connectorTrueDocument.id,
        key: DocumentMetadataKeyCode.IntegrationType,
        value: INTEGRATION_CONNECTOR_VALUE,
      }),
      TestHelper.documentMetadata.create({
        document_id: connectorTrueDocument.id,
        key: DocumentMetadataKeyCode.Verified,
        value: VERIFIED_TRUE_VALUE,
      }),
      TestHelper.documentMetadata.create({
        document_id: connectorTrueDocument.id,
        key: DocumentMetadataKeyCode.EntityTypes,
        value: JSON.stringify([ENTITY_TYPE_MALWARE]),
      }),
      TestHelper.documentMetadata.create({
        document_id: csvTrueDocument.id,
        key: DocumentMetadataKeyCode.IntegrationType,
        value: INTEGRATION_CSV_FEED_VALUE,
      }),
      TestHelper.documentMetadata.create({
        document_id: csvTrueDocument.id,
        key: DocumentMetadataKeyCode.Verified,
        value: VERIFIED_TRUE_VALUE,
      }),
      TestHelper.documentMetadata.create({
        document_id: csvTrueDocument.id,
        key: DocumentMetadataKeyCode.EntityTypes,
        value: JSON.stringify([ENTITY_TYPE_THREAT_ACTOR]),
      }),
      TestHelper.documentMetadata.create({
        document_id: connectorFalseDocument.id,
        key: DocumentMetadataKeyCode.IntegrationType,
        value: INTEGRATION_CONNECTOR_VALUE,
      }),
      TestHelper.documentMetadata.create({
        document_id: connectorFalseDocument.id,
        key: DocumentMetadataKeyCode.Verified,
        value: VERIFIED_FALSE_VALUE,
      }),
      TestHelper.documentMetadata.create({
        document_id: connectorFalseDocument.id,
        key: DocumentMetadataKeyCode.EntityTypes,
        value: JSON.stringify([ENTITY_TYPE_MALWARE]),
      }),
      objectUseCaseDomain.insertObjectUseCase({
        object_id: connectorTrueDocument.id,
        use_case_id: incidentUseCase.id,
      }),
      objectUseCaseDomain.insertObjectUseCase({
        object_id: csvTrueDocument.id,
        use_case_id: threatHuntingUseCase.id,
      }),
      objectSolutionCategoryDomain.insertObjectSolutionCategory({
        object_id: connectorTrueDocument.id,
        solution_category_id: edrSolutionCategory.id,
      }),
      objectSolutionCategoryDomain.insertObjectSolutionCategory({
        object_id: csvTrueDocument.id,
        solution_category_id: siemSolutionCategory.id,
      }),
    ]);

    // When
    const result = await FacetDomain.loadDocumentFacets({
      serviceInstanceId: serviceInstance.id,
      documentType: OPENCTI_INTEGRATION_DOCUMENT_TYPE,
      logicalFilters: {
        operator: LogicalOperator.And,
        children: [
          {
            leaf: {
              key: FilterKey.IntegrationType,
              value: [INTEGRATION_CONNECTOR_VALUE],
            },
          },
          {
            leaf: {
              key: FilterKey.Verified,
              value: [VERIFIED_TRUE_VALUE],
            },
          },
        ],
      },
    });

    // Then
    expect(result.integration_type).toEqual([
      { value: INTEGRATION_CONNECTOR_VALUE, count: 1 },
      { value: INTEGRATION_CSV_FEED_VALUE, count: 1 },
    ]);
    expect(result.verified).toEqual([
      { value: VERIFIED_FALSE_VALUE, count: 1 },
      { value: VERIFIED_TRUE_VALUE, count: 1 },
    ]);
    expect(result.use_case).toEqual([{ value: incidentUseCase.id, count: 1 }]);
    expect(result.solution_category).toEqual([
      { value: edrSolutionCategory.id, count: 1 },
    ]);
    expect(result.entity_type).toEqual([
      { value: ENTITY_TYPE_MALWARE, count: 1 },
    ]);
  });
});
