import { describe, expect, it } from 'vitest';
import { formatCancellationReason } from './trials-tab.utils';

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
