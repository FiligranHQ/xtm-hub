import { FilterKeyEnum } from '@generated/models/FilterKey.enum';
import { IntegrationSubTypeEnum } from '@generated/models/IntegrationSubType.enum';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { LogicalOperatorEnum } from '@generated/models/LogicalOperator.enum';
import { describe, expect, it } from 'vitest';
import {
  buildTypeSubtypeFilterExpression,
  getIntegrationSubTypeMetadata,
} from '@/components/service/integrations/Integration.utils';

describe('integration.utils', () => {
  describe('getIntegrationSubTypeMetadata', () => {
    it('should return metadata for a known subtype', () => {
      // When
      const result = getIntegrationSubTypeMetadata(
        IntegrationSubTypeEnum.EXTERNAL_IMPORT
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
        [IntegrationTypeEnum.CSV_FEED]: [],
      });

      // Then
      expect(filter).toEqual({
        leaf: {
          key: FilterKeyEnum.INTEGRATION_TYPE,
          value: [IntegrationTypeEnum.CSV_FEED],
        },
      });
    });

    it('should build an AND expression when one type has subtypes', () => {
      // When
      const filter = buildTypeSubtypeFilterExpression({
        [IntegrationTypeEnum.CONNECTOR]: [
          IntegrationSubTypeEnum.EXTERNAL_IMPORT,
          IntegrationSubTypeEnum.STREAM,
        ],
      });

      // Then
      expect(filter).toEqual({
        operator: LogicalOperatorEnum.AND,
        children: [
          {
            leaf: {
              key: FilterKeyEnum.INTEGRATION_TYPE,
              value: [IntegrationTypeEnum.CONNECTOR],
            },
          },
          {
            leaf: {
              key: FilterKeyEnum.INTEGRATION_SUBTYPE,
              value: [
                IntegrationSubTypeEnum.EXTERNAL_IMPORT,
                IntegrationSubTypeEnum.STREAM,
              ],
            },
          },
        ],
      });
    });

    it('builds an OR expression for multiple type/subtype groups', () => {
      // When
      const filter = buildTypeSubtypeFilterExpression({
        [IntegrationTypeEnum.CONNECTOR]: [
          IntegrationSubTypeEnum.EXTERNAL_IMPORT,
        ],
        [IntegrationTypeEnum.STREAM]: [IntegrationSubTypeEnum.NATIVE],
      });

      // Then
      expect(filter).toEqual({
        operator: LogicalOperatorEnum.OR,
        children: [
          {
            operator: LogicalOperatorEnum.AND,
            children: [
              {
                leaf: {
                  key: FilterKeyEnum.INTEGRATION_TYPE,
                  value: [IntegrationTypeEnum.CONNECTOR],
                },
              },
              {
                leaf: {
                  key: FilterKeyEnum.INTEGRATION_SUBTYPE,
                  value: [IntegrationSubTypeEnum.EXTERNAL_IMPORT],
                },
              },
            ],
          },
          {
            operator: LogicalOperatorEnum.AND,
            children: [
              {
                leaf: {
                  key: FilterKeyEnum.INTEGRATION_TYPE,
                  value: [IntegrationTypeEnum.STREAM],
                },
              },
              {
                leaf: {
                  key: FilterKeyEnum.INTEGRATION_SUBTYPE,
                  value: [IntegrationSubTypeEnum.NATIVE],
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
        [IntegrationTypeEnum.CONNECTOR]: [
          IntegrationSubTypeEnum.INTERNAL_IMPORT_FILE,
        ],
        [IntegrationTypeEnum.CSV_FEED]: [],
        [IntegrationTypeEnum.RSS_FEED]: [],
      });

      // Then
      expect(filter).toEqual({
        operator: LogicalOperatorEnum.OR,
        children: [
          {
            operator: LogicalOperatorEnum.AND,
            children: [
              {
                leaf: {
                  key: FilterKeyEnum.INTEGRATION_TYPE,
                  value: [IntegrationTypeEnum.CONNECTOR],
                },
              },
              {
                leaf: {
                  key: FilterKeyEnum.INTEGRATION_SUBTYPE,
                  value: [IntegrationSubTypeEnum.INTERNAL_IMPORT_FILE],
                },
              },
            ],
          },
          {
            leaf: {
              key: FilterKeyEnum.INTEGRATION_TYPE,
              value: [
                IntegrationTypeEnum.CSV_FEED,
                IntegrationTypeEnum.RSS_FEED,
              ],
            },
          },
        ],
      });
    });
  });
});
