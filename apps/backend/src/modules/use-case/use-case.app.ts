import { EditUseCaseInput } from '../../__generated__/resolvers-types';
import {
  ObjectUseCaseInitializer,
  ObjectUseCaseObjectId,
} from '../../model/kanel/public/ObjectUseCase';
import UseCase, {
  UseCaseId,
  UseCaseMutator,
} from '../../model/kanel/public/UseCase';
import { logApp } from '../../utils/app-logger.util';
import { ErrorCode } from '../../utils/error/error.code';
import { stripNulls } from '../../utils/typescript';
import { objectUseCaseDomain } from './object-use-case/object-use-case.domain';
import { useCaseDomain } from './use-case.domain';

export const useCaseApp = {
  linkUseCasesByNameToObject: async (
    objectId: ObjectUseCaseObjectId,
    useCaseNames: string[]
  ): Promise<void> => {
    if (!useCaseNames.length) {
      return;
    }

    const insertObjectUseCase: ObjectUseCaseInitializer[] = [];
    for (const name of useCaseNames) {
      const useCase = await useCaseDomain.loadUseCaseByLikeName(name);
      if (!useCase) {
        logApp.warn(
          `Skipping unknown use case link for object ${objectId}: ${name}`
        );
        continue;
      }
      insertObjectUseCase.push({
        object_id: objectId,
        use_case_id: useCase.id,
      });
    }

    if (!insertObjectUseCase.length) {
      return;
    }

    await objectUseCaseDomain.insertObjectUseCase(insertObjectUseCase);
  },

  deleteUseCaseBy: async (field: UseCaseMutator): Promise<UseCase> => {
    const useCase = await useCaseDomain.loadUseCaseBy(field);
    if (!useCase) {
      throw new Error(ErrorCode.UseCaseNotFound);
    }
    await objectUseCaseDomain.deleteObjectUseCaseBy({
      use_case_id: useCase.id,
    });
    const deletedUseCase = await useCaseDomain.deleteUseCase(field);
    if (!deletedUseCase) {
      throw new Error(ErrorCode.UseCaseNotFound);
    }
    return deletedUseCase;
  },

  editUseCaseById: async (
    id: UseCaseId,
    input: EditUseCaseInput
  ): Promise<UseCase> => {
    const updated = await useCaseDomain.updateUseCase(id, stripNulls(input));
    if (!updated) {
      throw new Error(ErrorCode.UseCaseNotFound);
    }
    return updated;
  },
};
