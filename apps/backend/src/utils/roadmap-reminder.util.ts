const REMINDER_TIME_ZONE = 'Europe/Paris';

/**
 * Whether the monthly public roadmap reminder is due today: the 25th of the
 * month, or the preceding Friday when the 25th falls on a weekend (weekends
 * only, not public holidays).
 *
 * The date is read in REMINDER_TIME_ZONE so the result does not depend on the
 * server/container timezone (the cron is scheduled in the same zone).
 */
export const isRoadmapReminderDay = (
  now: Date,
  timeZone: string = REMINDER_TIME_ZONE
): boolean => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const partValue = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value);

  const year = partValue('year');
  const month = partValue('month');
  const day = partValue('day');

  // A calendar date's weekday is timezone-independent, so compute it in UTC.
  const dayOfWeek = new Date(Date.UTC(year, month - 1, 25)).getUTCDay(); // 0=Sun, 6=Sat

  let reminderDayOfMonth = 25;
  if (dayOfWeek === 6) {
    reminderDayOfMonth = 24; // Saturday -> previous Friday
  } else if (dayOfWeek === 0) {
    reminderDayOfMonth = 23; // Sunday -> previous Friday
  }

  return day === reminderDayOfMonth;
};
