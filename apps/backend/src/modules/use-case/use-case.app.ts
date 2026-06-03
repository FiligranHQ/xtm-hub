import { EditUseCaseInput } from '../../__generated__/resolvers-types';
import UseCase, {
  UseCaseId,
  UseCaseInitializer,
  UseCaseMutator,
} from '../../model/kanel/public/UseCase';
import { UnknownErrorCode } from '../../utils/error/error.code';
import { objectUseCaseDomain } from './object-use-case/object-use-case.domain';
import { useCaseDomain } from './use-case.domain';

export const useCaseApp = {
  loadOrCreateUseCase: async ({
    name,
    color = '#0099cc',
  }: UseCaseInitializer): Promise<UseCase> => {
    const existing = await useCaseDomain.loadUseCaseByLikeName(name);
    if (existing) {
      return existing;
    }

    return useCaseDomain.insertUseCase({ name, color });
  },

  deleteUseCaseBy: async (field: UseCaseMutator): Promise<UseCase> => {
    const useCase = await useCaseDomain.loadUseCaseBy(field);
    await objectUseCaseDomain.deleteObjectUseCaseBy({
      use_case_id: useCase.id,
    });
    const deletedUseCase = await useCaseDomain.deleteUseCase(field);
    if (!deletedUseCase) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return deletedUseCase;
  },

  editUseCaseById: async (
    id: UseCaseId,
    input: EditUseCaseInput
  ): Promise<UseCase> => {
    const updated = await useCaseDomain.updateUseCase(id, input);
    if (!updated) {
      throw new Error(UnknownErrorCode.UnknownError);
    }
    return updated;
  },
};
