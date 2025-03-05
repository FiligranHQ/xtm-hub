export interface NumberFormat {
  number: number;
  symbol: string;
  original: number;
}
export const numberFormat = (number: number, digits = 2): NumberFormat => {
  const si = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'G' },
    { value: 1e12, symbol: 'T' },
    { value: 1e15, symbol: 'P' },
    { value: 1e18, symbol: 'E' },
  ];
  const rx = /\.0+$|(\.\d*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i -= 1) {
    if (number >= si[i]!.value) {
      break;
    }
  }
  return {
    number: Number.parseFloat(
      (number / si[i]!.value).toFixed(digits).replace(rx, '$1')
    ),
    symbol: si[i]!.symbol,
    original: number,
  };
};
