export const INTERVAL_UNITS = ['seconds', 'minutes', 'hours', 'days'] as const;
export type IntervalUnit = (typeof INTERVAL_UNITS)[number];

export const IntervalHelper = {
  subtractInterval: (date: Date, value: number, unit: IntervalUnit): Date => {
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
  },
};
