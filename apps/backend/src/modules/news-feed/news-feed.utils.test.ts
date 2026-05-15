import { describe, expect, it } from 'vitest';
import { subtractInterval } from './news-feed.utils';

describe('subtractInterval', () => {
  const reference = new Date('2026-05-13T12:00:00.000Z');

  it.each`
    unit         | value | expectedDeltaMs
    ${'seconds'} | ${30} | ${30 * 1000}
    ${'minutes'} | ${5}  | ${5 * 60 * 1000}
    ${'hours'}   | ${2}  | ${2 * 60 * 60 * 1000}
    ${'days'}    | ${7}  | ${7 * 24 * 60 * 60 * 1000}
  `(
    'should subtract $value $unit and produce a date $expectedDeltaMs ms earlier',
    ({ unit, value, expectedDeltaMs }) => {
      const result = subtractInterval(reference, value, unit);
      expect(reference.getTime() - result.getTime()).toBe(expectedDeltaMs);
    }
  );

  it('should subtract months handling variable month lengths', () => {
    const result = subtractInterval(reference, 6, 'months');
    expect(result.getMonth()).toBe(10); // mai - 6 mois = novembre
    expect(result.getFullYear()).toBe(2025);
  });

  it('should throw for unsupported unit', () => {
    expect(() => subtractInterval(reference, 1, 'years' as never)).toThrow(
      'Unsupported interval unit',
    );
  });
});