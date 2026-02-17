import UseCase, {
  UseCaseInitializer,
  UseCaseMutator,
} from '../../../model/kanel/public/UseCase';
import { objectUseCaseDomain } from '../objectUseCase/object-useCase.domain';
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
    return useCaseDomain.deleteUseCase(field);
  },
};
