export const FormatDate = (date?: string, withHours: boolean = true, locale: string = 'en-US') => {
  if (!date) {
    return null;
  }

  const dateObject = new Date(date);
  return dateObject.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

