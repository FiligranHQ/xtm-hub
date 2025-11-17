const isSemanticVersionString = (version: string): boolean => {
  const regex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
  return regex.test(version);
};

export const isCompatibleWithSemanticVersion = (
  givenVersion?: string | null,
  requiredVersion?: string | null
) => {
  const areVersionsDefined = !!givenVersion && !!requiredVersion;
  if (!areVersionsDefined) {
    return true;
  }

  const isAVersionNotFormattedAsSemanticVersion =
    !isSemanticVersionString(givenVersion) ||
    !isSemanticVersionString(requiredVersion);

  if (isAVersionNotFormattedAsSemanticVersion) {
    return true;
  }

  return compareSemanticVersions(givenVersion, requiredVersion) >= 0;
};

export const compareSemanticVersions = (a: string, b: string) => {
  const a1 = a.split('.');
  const b1 = b.split('.');
  for (let i = 0; i < a1.length; i++) {
    const a2 = +a1[i]! || 0;
    const b2 = +b1[i]! || 0;

    if (a2 !== b2) {
      return a2 > b2 ? 1 : -1;
    }
  }

  return 0;
};
