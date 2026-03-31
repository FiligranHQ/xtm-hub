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
    it.each([
      ['value', translations['Service.Trials.CancellationReason.value']],
      [
        'compatibility',
        translations['Service.Trials.CancellationReason.compatibility'],
      ],
      [
        'complexity',
        translations['Service.Trials.CancellationReason.complexity'],
      ],
      [
        'legal-security',
        translations['Service.Trials.CancellationReason.legal-security'],
      ],
      [
        'expertise',
        translations['Service.Trials.CancellationReason.expertise'],
      ],
    ])('should translate "%s" to its full label', (keyword, expected) => {
      expect(formatCancellationReason(keyword, mockT)).toBe(expected);
    });
  });

  describe('"Other" without free text', () => {
    it('should translate "Other" (capital, new submission) to the Other label', () => {
      expect(formatCancellationReason('Other', mockT)).toBe('Other');
    });

    it('should translate "other" (lowercase, migrated) to the Other label', () => {
      expect(formatCancellationReason('other', mockT)).toBe('Other');
    });

    it('should translate "OTHER" (any casing) to the Other label', () => {
      expect(formatCancellationReason('OTHER', mockT)).toBe('Other');
    });
  });

  describe('"Other: <free text>" with free text', () => {
    it('should format "Other: my custom reason" as "Other: my custom reason"', () => {
      expect(formatCancellationReason('Other: my custom reason', mockT)).toBe(
        'Other: my custom reason'
      );
    });

    it('should trim whitespace around the free text', () => {
      expect(
        formatCancellationReason('Other:   lots of spaces   ', mockT)
      ).toBe('Other: lots of spaces');
    });

    it('should handle "Other:" with no text after as just the Other label', () => {
      expect(formatCancellationReason('Other:', mockT)).toBe('Other');
    });

    it('should handle "Other:  " with only whitespace as just the Other label', () => {
      expect(formatCancellationReason('Other:  ', mockT)).toBe('Other');
    });

    it('should preserve colons in the free text', () => {
      expect(
        formatCancellationReason('Other: reason: with colons', mockT)
      ).toBe('Other: reason: with colons');
    });
  });

  describe('i18n integration', () => {
    it('should use the translated Other label for French locale', () => {
      const frTranslations: Record<string, string> = {
        'Service.Trials.Cancellation.ConfirmationForm.CancellationReasonOther':
          'Autre',
      };
      const frT = (key: string): string => frTranslations[key] ?? key;

      expect(formatCancellationReason('Other', frT)).toBe('Autre');
      expect(formatCancellationReason('other', frT)).toBe('Autre');
      expect(formatCancellationReason('Other: ma raison', frT)).toBe(
        'Autre: ma raison'
      );
    });
  });
});
