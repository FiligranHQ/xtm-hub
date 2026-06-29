import { describe, expect, it } from 'vitest';
import { isRoadmapReminderDay } from './roadmap-reminder.util';

describe('isRoadmapReminderDay', () => {
  // 25 June 2026 is a Thursday (a regular business day).
  it('returns true on the 25th when it is a weekday', () => {
    expect(isRoadmapReminderDay(new Date('2026-06-25T12:00:00Z'))).toBe(true);
  });

  it('returns false on a weekday that is not the reminder day', () => {
    expect(isRoadmapReminderDay(new Date('2026-06-24T12:00:00Z'))).toBe(false);
    expect(isRoadmapReminderDay(new Date('2026-06-26T12:00:00Z'))).toBe(false);
  });

  // 25 October 2026 is a Sunday -> reminder shifts to Friday the 23rd.
  it('shifts to the previous Friday when the 25th is a Sunday', () => {
    expect(isRoadmapReminderDay(new Date('2026-10-23T12:00:00Z'))).toBe(true);
    expect(isRoadmapReminderDay(new Date('2026-10-25T12:00:00Z'))).toBe(false);
  });

  // 25 April 2026 is a Saturday -> reminder shifts to Friday the 24th.
  it('shifts to the previous Friday when the 25th is a Saturday', () => {
    expect(isRoadmapReminderDay(new Date('2026-04-24T12:00:00Z'))).toBe(true);
    expect(isRoadmapReminderDay(new Date('2026-04-25T12:00:00Z'))).toBe(false);
  });

  it('is independent of the server timezone (computed in Europe/Paris)', () => {
    // 08:00 UTC on the 25th = 10:00 in Paris, still the 25th.
    expect(isRoadmapReminderDay(new Date('2026-06-25T08:00:00Z'))).toBe(true);
  });
});
