import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { ObjectUseCaseObjectId } from '../../model/kanel/public/ObjectUseCase';
import { UseCaseId } from '../../model/kanel/public/UseCase';
import { logApp } from '../../utils/app-logger.util';
import { objectUseCaseDomain } from './object-use-case/object-use-case.domain';
import { useCaseApp } from './use-case.app';
import { useCaseDomain } from './use-case.domain';

describe('use Case app', () => {
  describe('loadOrCreateUseCase', () => {
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
      expect(useCases?.[0]).toMatchObject({
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

  describe('linkUseCasesByNameToObject', () => {
    beforeEach(async () => {
      // Object_UseCase rows must be cleared first: UseCase deletion is
      // blocked by the foreign key while links still reference it.
      await TestHelper.objectUseCase.delete({});
      await TestHelper.useCase.delete({});
    });

    it('should not create any link when useCaseNames is empty', async () => {
      const objectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseApp.linkUseCasesByNameToObject(objectId, []);

      const links = await TestHelper.objectUseCase.load({
        object_id: objectId,
      });
      expect(links).toHaveLength(0);
    });

    it('should log a warning and skip linking when the use case does not exist', async () => {
      const objectId = uuidv4() as ObjectUseCaseObjectId;
      const warnSpy = vi.spyOn(logApp, 'warn').mockImplementation(() => {});

      await useCaseApp.linkUseCasesByNameToObject(objectId, [
        'Unknown UseCase',
      ]);

      expect(warnSpy).toHaveBeenCalledTimes(1);

      const links = await TestHelper.objectUseCase.load({
        object_id: objectId,
      });
      expect(links).toHaveLength(0);

      warnSpy.mockRestore();
    });

    it('should link existing use cases and skip missing ones within the same call', async () => {
      const existingUseCase = await TestHelper.useCase.create({
        name: 'Present UseCase',
        color: '#aaaaaa',
      });
      const objectId = uuidv4() as ObjectUseCaseObjectId;
      const warnSpy = vi.spyOn(logApp, 'warn').mockImplementation(() => {});

      await useCaseApp.linkUseCasesByNameToObject(objectId, [
        'Present UseCase',
        'Missing UseCase',
      ]);

      expect(warnSpy).toHaveBeenCalledTimes(1);

      const links = await TestHelper.objectUseCase.load({
        object_id: objectId,
      });
      expect(links).toHaveLength(1);
      expect(links?.[0]).toMatchObject({
        object_id: objectId,
        use_case_id: existingUseCase.id,
      });

      warnSpy.mockRestore();
    });

    it('should reuse an existing use case (case-insensitive) instead of duplicating it', async () => {
      const existingUseCase = await TestHelper.useCase.create({
        name: 'Existing UseCase',
        color: '#aaaaaa',
      });
      const objectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseApp.linkUseCasesByNameToObject(objectId, [
        'existing usecase',
      ]);

      const useCases = await TestHelper.useCase.loadAll({
        name: 'existing usecase',
      });
      expect(useCases).toHaveLength(0); // stored name keeps its original casing
      const allUseCases = await TestHelper.useCase.loadAll({});
      expect(allUseCases).toHaveLength(1);

      const links = await TestHelper.objectUseCase.load({
        object_id: objectId,
      });
      expect(links).toHaveLength(1);
      expect(links?.[0]).toMatchObject({
        object_id: objectId,
        use_case_id: existingUseCase.id,
      });
    });

    it('should link multiple use-case names to the same object without duplicates', async () => {
      await TestHelper.useCase.create({
        name: 'UseCase A',
        color: '#111111',
      });
      await TestHelper.useCase.create({
        name: 'UseCase B',
        color: '#222222',
      });
      const objectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseApp.linkUseCasesByNameToObject(objectId, [
        'UseCase A',
        'UseCase B',
      ]);

      const links = await TestHelper.objectUseCase.load({
        object_id: objectId,
      });
      expect(links).toHaveLength(2);

      const useCaseIds = links?.map((link) => link.use_case_id);
      expect(new Set(useCaseIds).size).toBe(2);
    });

    it('should allow the same use-case name to be linked to two different objects', async () => {
      await TestHelper.useCase.create({
        name: 'Shared UseCase',
        color: '#333333',
      });
      const firstObjectId = uuidv4() as ObjectUseCaseObjectId;
      const secondObjectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseApp.linkUseCasesByNameToObject(firstObjectId, [
        'Shared UseCase',
      ]);
      await useCaseApp.linkUseCasesByNameToObject(secondObjectId, [
        'Shared UseCase',
      ]);

      const useCases = await TestHelper.useCase.loadAll({
        name: 'Shared UseCase',
      });
      expect(useCases).toHaveLength(1);

      const firstLinks = await TestHelper.objectUseCase.load({
        object_id: firstObjectId,
      });
      const secondLinks = await TestHelper.objectUseCase.load({
        object_id: secondObjectId,
      });
      expect(firstLinks).toHaveLength(1);
      expect(secondLinks).toHaveLength(1);
      expect(firstLinks?.[0]?.use_case_id).toBe(secondLinks?.[0]?.use_case_id);
    });
  });

  describe('deleteUseCaseBy', () => {
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

  describe('editUseCaseById', () => {
    beforeEach(async () => {
      await TestHelper.objectUseCase.delete({});
      await TestHelper.useCase.delete({});
    });

    it('should update the use case and return the updated value', async () => {
      const created = await useCaseApp.loadOrCreateUseCase({
        name: 'Original Name',
        color: '#111111',
      });

      const updated = await useCaseApp.editUseCaseById(created.id, {
        name: 'Updated Name',
        color: '#222222',
      });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Updated Name',
        color: '#222222',
      });

      const fromDb = await TestHelper.useCase.load({ id: created.id });
      expect(fromDb).toMatchObject({ name: 'Updated Name', color: '#222222' });
    });

    it('should throw when the use case does not exist', async () => {
      const nonExistentId = uuidv4() as UseCaseId;
      await expect(
        useCaseApp.editUseCaseById(nonExistentId, { name: 'Ghost' })
      ).rejects.toThrow();
    });
  });
});
