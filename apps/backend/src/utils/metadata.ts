export interface OptionalMetadata {
  key: string;
  optional?: boolean;
}

export type MetadataArray<T extends string> = Array<{
  key: T;
  optional?: boolean;
}>;
