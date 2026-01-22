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
