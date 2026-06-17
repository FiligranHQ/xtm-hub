import { describe, expect, it } from 'vitest';
import { isRoadmapReminderDay } from './roadmap-reminder.util';

describe('isRoadmapReminderDay', () => {
  // June 2026: the 25th is a Thursday (a regular business day).
  it('returns true on the 25th when it is a weekday', () => {
    expect(isRoadmapReminderDay(new Date(2026, 5, 25))).toBe(true);
  });

  it('returns false on a weekday that is not the reminder day', () => {
    expect(isRoadmapReminderDay(new Date(2026, 5, 24))).toBe(false);
    expect(isRoadmapReminderDay(new Date(2026, 5, 26))).toBe(false);
  });

  // October 2026: the 25th is a Sunday -> reminder shifts to Friday the 23rd.
  it('shifts to the previous Friday when the 25th is a Sunday', () => {
    expect(isRoadmapReminderDay(new Date(2026, 9, 23))).toBe(true);
    expect(isRoadmapReminderDay(new Date(2026, 9, 25))).toBe(false);
  });

  // April 2026: the 25th is a Saturday -> reminder shifts to Friday the 24th.
  it('shifts to the previous Friday when the 25th is a Saturday', () => {
    expect(isRoadmapReminderDay(new Date(2026, 3, 24))).toBe(true);
    expect(isRoadmapReminderDay(new Date(2026, 3, 25))).toBe(false);
  });
});
