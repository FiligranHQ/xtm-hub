import { Resolvers } from '../../__generated__/resolvers-types';
import { UseCaseId, UseCaseMutator } from '../../model/kanel/public/UseCase';
import { createRelayIdScalar } from '../../utils/scalar.util';
import { useCaseApp } from './use-case.app';
import { useCaseDomain } from './use-case.domain';

const resolvers: Resolvers = {
  UseCaseId: createRelayIdScalar<UseCaseId>('UseCase'),
  Query: {
    useCases: (_, opts) => useCaseDomain.loadUseCases(opts),
  },
  Mutation: {
    addUseCase: (_, { input }) =>
      useCaseDomain.insertUseCase({ ...input, product: input.product ?? [] }),
    editUseCase: (_, { id, input }) =>
      useCaseApp.editUseCaseById(id as UseCaseId, input),
    deleteUseCase: (_, { id }) =>
      useCaseApp.deleteUseCaseBy({ id } as UseCaseMutator),
  },
};

export default resolvers;
