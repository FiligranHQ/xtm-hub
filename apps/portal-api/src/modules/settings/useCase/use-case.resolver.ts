import { Resolvers } from '../../../__generated__/resolvers-types';
import { UseCaseId, UseCaseMutator } from '../../../model/kanel/public/UseCase';
import { useCaseApp } from './use-case.app';
import { useCaseDomain } from './use-case.domain';

const resolvers: Resolvers = {
  Query: {
    useCases: (_, opts) => useCaseDomain.loadUseCases(opts),
    useCase: (_, { id }) =>
      useCaseDomain.loadUseCaseBy({ id } as UseCaseMutator),
  },
  Mutation: {
    addUseCase: (_, { input }) => useCaseDomain.insertUseCase(input),
    editUseCase: (_, { id, input }) =>
      useCaseDomain.updateUseCase(id as UseCaseId, input),
    deleteUseCase: (_, { id }) =>
      useCaseApp.deleteUseCaseBy({ id } as UseCaseMutator),
  },
};

export default resolvers;
