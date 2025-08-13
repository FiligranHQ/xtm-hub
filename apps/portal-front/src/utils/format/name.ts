export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(
      /(^|[\s-])([a-z])/g,
      (_, separator, letter) => separator + letter.toUpperCase()
    );
};

export const formatPersonNames = (
  person?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null
): string => {
  if (!person) {
    return '';
  }

  return `${formatName(person.first_name ?? '')} ${formatName(person.last_name ?? '')}`.trim();
};
