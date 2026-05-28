import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  useUseCaseDeleteMutation,
  type UseCaseDeleteMutation,
} from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useCaseKeys } from '../use-case.keys';
import { type MutationCallbacks } from '../use-case.types';

export const useDeleteUseCase = (
  callbacks: MutationCallbacks<UseCaseDeleteMutation> = {}
) => {
  const queryClient = useQueryClient();
  return useUseCaseDeleteMutation(portalGraphqlClient, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: useCaseKeys.all });
      callbacks.onSuccess?.(data);
    },
    onError: callbacks.onError,
  });
};
