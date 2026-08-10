const KEY_SEPARATOR = ':';

declare const compositeKeyBrand: unique symbol;

export type CompositeKey<Fields extends Record<string, string>> = string & {
  readonly [compositeKeyBrand]: Fields;
};

export interface CompositeKeyCodec<Fields extends Record<string, string>> {
  create: (values: Fields) => CompositeKey<Fields>;
  parse: (key: CompositeKey<Fields>) => Fields;
}

// DataLoader keys must be primitives, so composite keys are encoded as
// `value1:value2:...` following the declared `fieldNames` order.
export const defineCompositeKey = <Fields extends Record<string, string>>(
  fieldNames: readonly (keyof Fields & string)[]
): CompositeKeyCodec<Fields> => ({
  create: (values) =>
    fieldNames
      .map((fieldName) => values[fieldName])
      .join(KEY_SEPARATOR) as CompositeKey<Fields>,

  parse: (key) => {
    const values = key.split(KEY_SEPARATOR);
    if (
      values.length !== fieldNames.length ||
      values.some((value) => value === '')
    ) {
      throw new Error(`Invalid composite key: ${key}`);
    }

    return Object.fromEntries(
      fieldNames.map((fieldName, index) => [fieldName, values[index]])
    ) as Fields;
  },
});
