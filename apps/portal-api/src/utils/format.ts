export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(
      /(^|[\s-])([a-z])/g,
      (_, separator, letter) => separator + letter.toUpperCase()
    );
};
