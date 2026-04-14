import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { ObjectUseCaseObjectId } from '../../model/kanel/public/ObjectUseCase';
import { objectUseCaseDomain } from './object-use-case/object-use-case.domain';
import { useCaseApp } from './use-case.app';
import { useCaseDomain } from './use-case.domain';

describe('Use Case app', () => {
  describe(`${useCaseApp.loadOrCreateUseCase.name}`, () => {
    beforeEach(async () => {
      // Clean up the Use Case table before each test
      await TestHelper.useCase.delete({});
    });

    it('should create a new useCase when it does not exist', async () => {
      const newUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'Test UseCase',
        color: '#ff0000',
      });

      // Verify the use Case was created
      const useCase = await TestHelper.useCase.load({ id: newUseCase.id });

      expect(useCase).toMatchObject({
        name: 'Test UseCase',
        color: '#ff0000',
      });
    });

    it('should return existing use case id when use case already exists', async () => {
      // Create a use case first
      const firstUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'Existing Use Case',
        color: '#00ff00',
      });

      // Try to create the same use case again
      const secondUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'Existing Use Case',
        color: '#0000ff', // Different color
      });

      // Should return the same ID
      expect(secondUseCase.id).toBe(firstUseCase.id);

      // Verify only one use case exists with the original color
      const useCases = await TestHelper.useCase.loadAll({
        name: 'Existing Use Case',
      });

      expect(useCases).toHaveLength(1);
      expect(useCases?.[0]?.color).toBe('#00ff00'); // Original color preserved
    });

    it('should be case-insensitive for use case names', async () => {
      // Create use case  with lowercase
      const lowercaseUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'test usecase',
        color: '#aaaaaa',
      });

      // Try to create with uppercase - should return same use case
      const uppercaseUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'TEST USECASE',
        color: '#bbbbbb',
      });

      // Should return the same use case ID
      expect(uppercaseUseCase.id).toBe(lowercaseUseCase.id);

      // Try mixed case
      const mixedCaseUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'Test UseCase',
        color: '#cccccc',
      });

      expect(mixedCaseUseCase.id).toBe(lowercaseUseCase.id);

      // Verify only one use case exists with original name and color
      const useCases = await TestHelper.useCase.loadAll({});
      expect(useCases).toHaveLength(1);
      expect(useCases).toMatchObject({
        name: 'test usecase',
        color: '#aaaaaa',
      });
    });

    it('should use default color when color is not provided', async () => {
      const newUseCase = await useCaseApp.loadOrCreateUseCase({
        name: 'Default Color UseCase',
        color: '#0099cc', // This is the default
      });

      expect(newUseCase.color).toBe('#0099cc');
    });

    it('should handle multiple different use cases', async () => {
      const useCase1 = await useCaseApp.loadOrCreateUseCase({
        name: 'UseCase 1',
        color: '#111111',
      });

      const useCase2 = await useCaseApp.loadOrCreateUseCase({
        name: 'UseCase 2',
        color: '#222222',
      });

      const useCase3 = await useCaseApp.loadOrCreateUseCase({
        name: 'UseCase 3',
        color: '#333333',
      });

      // All IDs should be different
      expect(useCase1.id).not.toBe(useCase2.id);
      expect(useCase2.id).not.toBe(useCase3.id);
      expect(useCase1.id).not.toBe(useCase3.id);

      // Verify all use cases exist
      const useCases = await TestHelper.useCase.loadAll({});
      expect(useCases).toHaveLength(3);
    });
  });

  describe(`${useCaseApp.deleteUseCaseBy.name}`, () => {
    it('should remove object use case associated to use case', async () => {
      const useCase1 = await useCaseApp.loadOrCreateUseCase({
        name: 'UseCase 1',
        color: '#111111',
      });

      await objectUseCaseDomain.insertObjectUseCase({
        object_id: uuidv4() as ObjectUseCaseObjectId,
        use_case_id: useCase1.id,
      });

      await objectUseCaseDomain.insertObjectUseCase({
        object_id: uuidv4() as ObjectUseCaseObjectId,
        use_case_id: useCase1.id,
      });

      await useCaseApp.deleteUseCaseBy({ name: 'UseCase 1' });

      const resultUseCase1 = await useCaseDomain.loadUseCaseBy({
        name: 'UseCase 1',
      });
      expect(resultUseCase1).toBeUndefined();

      const resultObjectUseCases = await TestHelper.objectUseCase.load({
        use_case_id: useCase1.id,
      });

      expect(resultObjectUseCases).toHaveLength(0);
    });
  });
});
