export type IntervalUnit = 'seconds' | 'minutes' | 'hours' | 'days';

export const subtractInterval = (
  date: Date,
  value: number,
  unit: IntervalUnit
): Date => {
  const result = new Date(date);
  switch (unit) {
    case 'days':
      result.setDate(result.getDate() - value);
      break;
    case 'hours':
      result.setHours(result.getHours() - value);
      break;
    case 'minutes':
      result.setMinutes(result.getMinutes() - value);
      break;
    case 'seconds':
      result.setSeconds(result.getSeconds() - value);
      break;
    default:
      throw new Error(`Unsupported interval unit: ${unit}`);
  }
  return result;
};