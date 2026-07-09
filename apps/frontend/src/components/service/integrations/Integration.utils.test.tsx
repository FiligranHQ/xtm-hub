import {
  buildTypeSubtypeFilterExpression,
  getIntegrationSubTypeMetadata,
} from '@/components/service/integrations/Integration.utils';
import {
  FilterKey,
  IntegrationSubType,
  IntegrationType,
  LogicalOperator,
} from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('integration.utils', () => {
  describe('getIntegrationSubTypeMetadata', () => {
    it('should return metadata for a known subtype', () => {
      // When
      const result = getIntegrationSubTypeMetadata(
        IntegrationSubType.ExternalImport
      );

      // Then
      expect(result).toEqual({
        label: 'External import',
        color: '#0099cc',
      });
    });

    it('should return undefined for unknown or missing subtype', () => {
      expect(getIntegrationSubTypeMetadata(undefined)).toBeUndefined();
      expect(getIntegrationSubTypeMetadata('UNKNOWN_SUBTYPE')).toBeUndefined();
    });
  });

  describe('buildTypeSubtypeFilterExpression', () => {
    it('should return null when selection is missing or empty', () => {
      expect(buildTypeSubtypeFilterExpression()).toBeNull();
      expect(buildTypeSubtypeFilterExpression({})).toBeNull();
    });

    it('should build a single type leaf when type has no selected subtype', () => {
      // When
      const filter = buildTypeSubtypeFilterExpression({
        [IntegrationType.CsvFeed]: [],
      });

      // Then
      expect(filter).toEqual({
        leaf: {
          key: FilterKey.IntegrationType,
          value: [IntegrationType.CsvFeed],
        },
      });
    });

    it('should build an AND expression when one type has subtypes', () => {
      // When
      const filter = buildTypeSubtypeFilterExpression({
        [IntegrationType.Connector]: [
          IntegrationSubType.ExternalImport,
          IntegrationSubType.Stream,
        ],
      });

      // Then
      expect(filter).toEqual({
        operator: LogicalOperator.And,
        children: [
          {
            leaf: {
              key: FilterKey.IntegrationType,
              value: [IntegrationType.Connector],
            },
          },
          {
            leaf: {
              key: FilterKey.IntegrationSubtype,
              value: [
                IntegrationSubType.ExternalImport,
                IntegrationSubType.Stream,
              ],
            },
          },
        ],
      });
    });

    it('builds an OR expression for multiple type/subtype groups', () => {
      // When
      const filter = buildTypeSubtypeFilterExpression({
        [IntegrationType.Connector]: [IntegrationSubType.ExternalImport],
        [IntegrationType.Stream]: [IntegrationSubType.Native],
      });

      // Then
      expect(filter).toEqual({
        operator: LogicalOperator.Or,
        children: [
          {
            operator: LogicalOperator.And,
            children: [
              {
                leaf: {
                  key: FilterKey.IntegrationType,
                  value: [IntegrationType.Connector],
                },
              },
              {
                leaf: {
                  key: FilterKey.IntegrationSubtype,
                  value: [IntegrationSubType.ExternalImport],
                },
              },
            ],
          },
          {
            operator: LogicalOperator.And,
            children: [
              {
                leaf: {
                  key: FilterKey.IntegrationType,
                  value: [IntegrationType.Stream],
                },
              },
              {
                leaf: {
                  key: FilterKey.IntegrationSubtype,
                  value: [IntegrationSubType.Native],
                },
              },
            ],
          },
        ],
      });
    });

    it('groups types without subtypes in one INTEGRATION_TYPE leaf', () => {
      // When
      const filter = buildTypeSubtypeFilterExpression({
        [IntegrationType.Connector]: [IntegrationSubType.InternalImportFile],
        [IntegrationType.CsvFeed]: [],
        [IntegrationType.RssFeed]: [],
      });

      // Then
      expect(filter).toEqual({
        operator: LogicalOperator.Or,
        children: [
          {
            operator: LogicalOperator.And,
            children: [
              {
                leaf: {
                  key: FilterKey.IntegrationType,
                  value: [IntegrationType.Connector],
                },
              },
              {
                leaf: {
                  key: FilterKey.IntegrationSubtype,
                  value: [IntegrationSubType.InternalImportFile],
                },
              },
            ],
          },
          {
            leaf: {
              key: FilterKey.IntegrationType,
              value: [IntegrationType.CsvFeed, IntegrationType.RssFeed],
            },
          },
        ],
      });
    });
  });
});
