import {
  STANDALONE_PARENT_ID_FILTER_VALUE,
  buildTrialsFilters,
  formatCancellationReason,
  sortProducts,
} from '@/components/trials/tab/trials-tab.utils';
import {
  BUNDLE_SCOPE,
  TrialsTabType,
  productScope,
} from '@/components/trials/trials.const';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestFilterKey,
  DeploymentRequestHubStatus,
  PlatformIdentifier,
  TrialsProductFragment,
} from '@graphql/generated';
import { describe, expect, it } from 'vitest';

describe('manageTrialsUtils', () => {
  describe('buildTrialsFilters', () => {
    it.each(Object.values(TrialsTabType))(
      'should only ask for bundles on the %s tab',
      (type) => {
        // When
        const filters = buildTrialsFilters(type, BUNDLE_SCOPE);

        // Then
        expect(filters).toContainEqual({
          key: DeploymentRequestFilterKey.Type,
          value: [DeploymentRequestDeploymentType.Bundle],
        });
      }
    );

    it.each(Object.values(TrialsTabType))(
      'should only ask for the scoped product trials on the %s tab',
      (type) => {
        // When
        const filters = buildTrialsFilters(
          type,
          productScope(PlatformIdentifier.Opencti)
        );

        // Then
        expect(filters).toContainEqual({
          key: DeploymentRequestFilterKey.Type,
          value: [DeploymentRequestDeploymentType.Trial],
        });
        expect(filters).toContainEqual({
          key: DeploymentRequestFilterKey.PlatformIdentifier,
          value: [PlatformIdentifier.Opencti],
        });
      }
    );

    it.each(Object.values(TrialsTabType))(
      'should exclude the bundle children from the product scope on the %s tab',
      (type) => {
        // When
        const filters = buildTrialsFilters(
          type,
          productScope(PlatformIdentifier.Opencti)
        );

        // Then
        expect(filters).toContainEqual({
          key: DeploymentRequestFilterKey.ParentId,
          value: [STANDALONE_PARENT_ID_FILTER_VALUE],
        });
      }
    );

    it('should restrict the waiting tab to queued requests', () => {
      // When
      const filters = buildTrialsFilters(TrialsTabType.Waiting, BUNDLE_SCOPE);

      // Then
      expect(filters).toContainEqual({
        key: DeploymentRequestFilterKey.HubStatus,
        value: [DeploymentRequestHubStatus.Queued],
      });
    });
  });

  describe('sortProducts', () => {
    const product = (
      platformIdentifier: PlatformIdentifier
    ): TrialsProductFragment => ({
      id: `product-${platformIdentifier}`,
      platform_identifier: platformIdentifier,
      hub_status: DeploymentRequestHubStatus.Active,
      platform_id: 'platform-1',
      service_instance_id: `instance-${platformIdentifier}`,
    });

    it('should always order the products the same way, whatever the order they come in', () => {
      // Given
      const opencti = product(PlatformIdentifier.Opencti);
      const openaev = product(PlatformIdentifier.Openaev);
      const xtmone = product(PlatformIdentifier.Xtmone);

      // When
      const sorted = sortProducts([xtmone, openaev, opencti]);

      // Then
      expect(sorted).toEqual([opencti, openaev, xtmone]);
    });
  });

  /**
   * Mock translation function that simulates next-intl's `t()`.
   * Returns the actual translated value for known keys, and the raw key
   * for anything else (mimicking next-intl's fallback behavior).
   */
  const translations: Record<string, string> = {
    'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther':
      'Other',
    'Service.Trials.CancellationReason.value':
      'Intelligence lacks actionable insight for our specific needs',
    'Service.Trials.CancellationReason.compatibility':
      'Incompatible with our existing security stack',
    'Service.Trials.CancellationReason.complexity':
      'Configuration is too complex to complete within a reasonable timeframe',
    'Service.Trials.CancellationReason.legal-security':
      'Internal security or legal team required immediate termination',
    'Service.Trials.CancellationReason.expertise':
      'We lack the internal analysts/expertise to utilise the tool effectively',
  };

  const mockT = (key: string): string => translations[key] ?? key;

  describe('formatCancellationReason', () => {
    describe('standard reasons (known keywords)', () => {
      it.each`
        reason              | expected
        ${'value'}          | ${translations['Service.Trials.CancellationReason.value']}
        ${'compatibility'}  | ${translations['Service.Trials.CancellationReason.compatibility']}
        ${'complexity'}     | ${translations['Service.Trials.CancellationReason.complexity']}
        ${'legal-security'} | ${translations['Service.Trials.CancellationReason.legal-security']}
        ${'expertise'}      | ${translations['Service.Trials.CancellationReason.expertise']}
      `(
        'should translate "$reason" to its full label',
        ({ reason, expected }) => {
          expect(formatCancellationReason(reason, mockT)).toBe(expected);
        }
      );
    });

    describe('"Other" without free text', () => {
      it.each`
        reason     | description
        ${'Other'} | ${'capital O — new submission'}
        ${'other'} | ${'lowercase — migrated from old data'}
        ${'OTHER'} | ${'all caps — any casing'}
      `(
        'should return the Other label for "$reason" ($description)',
        ({ reason }) => {
          expect(formatCancellationReason(reason, mockT)).toBe('Other');
        }
      );
    });

    describe('"Other: <free text>" with free text', () => {
      it.each`
        reason                          | expected                        | description
        ${'Other: my custom reason'}    | ${'Other: my custom reason'}    | ${'standard free text'}
        ${'Other:   lots of spaces   '} | ${'Other: lots of spaces'}      | ${'whitespace trimmed'}
        ${'Other:'}                     | ${'Other'}                      | ${'empty after colon'}
        ${'Other:  '}                   | ${'Other'}                      | ${'only whitespace after colon'}
        ${'Other: reason: with colons'} | ${'Other: reason: with colons'} | ${'colons preserved in free text'}
      `(
        'should format "$reason" as "$expected" ($description)',
        ({ reason, expected }) => {
          expect(formatCancellationReason(reason, mockT)).toBe(expected);
        }
      );
    });

    describe('i18n — French locale', () => {
      const frT = (key: string): string =>
        key ===
        'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther'
          ? 'Autre'
          : key;

      it.each`
        reason                | expected
        ${'Other'}            | ${'Autre'}
        ${'other'}            | ${'Autre'}
        ${'Other: ma raison'} | ${'Autre: ma raison'}
      `(
        'should return "$expected" for "$reason" in FR',
        ({ reason, expected }) => {
          expect(formatCancellationReason(reason, frT)).toBe(expected);
        }
      );
    });
  });
});
