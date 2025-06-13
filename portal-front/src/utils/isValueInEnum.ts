// Generic utility function to check if a value exists in an enum
export function isValueInEnum<T extends Record<string, unknown>>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  const enumValues = Object.values(enumObject);
  return enumValues.includes(value);
}
