import { DateTimeFormatOptions, useFormatter } from 'next-intl';

// Define FormatDateStyle as a type instead of an enum
export type FormatDateStyle = 'DATE_NUMERIC' | 'DATETIME_NUMERIC' | 'DATE_FULL';

// Map each variant to its respective DateTime format options
export type DateStyleFunctionMap = {
  [key in FormatDateStyle]: DateTimeFormatOptions;
};

const DATE_STYLE_FORMAT: DateStyleFunctionMap = {
  DATE_NUMERIC: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  },
  DATETIME_NUMERIC: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
  DATE_FULL: {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  },
};

export const formatDate = (
  date?: Date | string,
  dateStyle: FormatDateStyle = 'DATE_NUMERIC'
) => {
  if (!date) {
    return null;
  }

  const dateObject = new Date(date);
  const format = useFormatter();

  return format.dateTime(dateObject, {
    ...DATE_STYLE_FORMAT[dateStyle],
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
};
