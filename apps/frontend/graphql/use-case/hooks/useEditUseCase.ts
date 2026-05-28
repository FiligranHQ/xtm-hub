import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  useUseCaseEditMutation,
  type UseCaseEditMutation,
} from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useCaseKeys } from '../use-case.keys';
import { type MutationCallbacks } from '../use-case.types';

export const useEditUseCase = (
  callbacks: MutationCallbacks<UseCaseEditMutation> = {}
) => {
  const queryClient = useQueryClient();
  return useUseCaseEditMutation(portalGraphqlClient, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: useCaseKeys.all });
      callbacks.onSuccess?.(data);
    },
    onError: callbacks.onError,
  });
};
