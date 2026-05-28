import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  useUseCaseAddMutation,
  type UseCaseAddMutation,
} from '@graphql/generated';
import { useQueryClient } from '@tanstack/react-query';
import { useCaseKeys } from '../use-case.keys';
import { type MutationCallbacks } from '../use-case.types';

export const useAddUseCase = (
  callbacks: MutationCallbacks<UseCaseAddMutation> = {}
) => {
  const queryClient = useQueryClient();
  return useUseCaseAddMutation(portalGraphqlClient, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: useCaseKeys.all });
      callbacks.onSuccess?.(data);
    },
    onError: callbacks.onError,
  });
};
