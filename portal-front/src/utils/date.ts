export const FormatDate = (date?: string, withHours: boolean = true) => {
  if (!date) {
    return null;
  }
  const dateObject = new Date(date);
  if (isNaN(dateObject.getTime())) {
    return null;
  }
  // Extract date components
  const day = dateObject.getUTCDate();
  const month = dateObject.getUTCMonth() + 1; // Months are zero-based
  const year = dateObject.getUTCFullYear();
  const hours = dateObject.getUTCHours();
  const minutes = dateObject.getUTCMinutes();
  const seconds = dateObject.getUTCSeconds();

  function pad(number: number) {
    if (number < 10) {
      return '0' + number;
    }
    return number;
  }

  // Pad single digit values with leading zeros
  return withHours
    ? `${pad(day)}/${pad(month)}/${year} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(day)}/${pad(month)}/${year}`;
};
