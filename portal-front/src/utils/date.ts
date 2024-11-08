import { useFormatter } from 'next-intl';
export const FormatDate = (date?: Date, withHours: boolean = true) => {
  if (!date) {
    return null;
  }

  const dateObject = new Date(date);
  const format = useFormatter();
  if (withHours) {
    return format.dateTime(dateObject, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
  return format.dateTime(dateObject, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};
