/**
 * Determines whether the monthly public roadmap reminder should be sent today.
 *
 * The reminder is due on the 25th of the month, or on the preceding Friday when
 * the 25th falls on a weekend. Only weekends are taken into account here, not
 * public holidays (deliberate simplification for an internal reminder).
 *
 * The cron is scheduled to run every weekday morning; this guard ensures the
 * email is only sent on the correct day.
 */
export const isRoadmapReminderDay = (now: Date): boolean => {
  const twentyFifth = new Date(now.getFullYear(), now.getMonth(), 25);
  const dayOfWeek = twentyFifth.getDay(); // 0 = Sunday, 6 = Saturday

  let reminderDayOfMonth = 25;
  if (dayOfWeek === 6) {
    reminderDayOfMonth = 24; // Saturday -> previous Friday
  } else if (dayOfWeek === 0) {
    reminderDayOfMonth = 23; // Sunday -> previous Friday
  }

  return now.getDate() === reminderDayOfMonth;
};
