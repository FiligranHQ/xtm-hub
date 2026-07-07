export const formatDateCompact = (date: Date): string => {
  const yy = String(date.getUTCFullYear()).slice(2);
  const MM = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${yy}${MM}${dd}${hh}${mm}${ss}`;
};

export const formatName = (name: string | undefined | null): string => {
  if (!name) {
    return '';
  }

  return name
    .toLowerCase()
    .trim()
    .replace(
      /(^|[\s-])([a-z])/g,
      (_, separator, letter) => separator + letter.toUpperCase()
    );
};
