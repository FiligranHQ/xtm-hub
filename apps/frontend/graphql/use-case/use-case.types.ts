export type MutationCallbacks<TData> = {
  onSuccess?: (data: TData) => void;
  onError?: (error: unknown) => void;
};
