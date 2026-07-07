import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../tests/helper/test.helper';
import { ObjectUseCaseObjectId } from '../../model/kanel/public/ObjectUseCase';
import { UseCaseId } from '../../model/kanel/public/UseCase';
import { objectUseCaseDomain } from './object-use-case/object-use-case.domain';
import { useCaseApp } from './use-case.app';
import { useCaseDomain } from './use-case.domain';

describe('use Case app', () => {
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

    it('should skip unknown use cases and not create link', async () => {
      const objectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseApp.linkUseCasesByNameToObject(objectId, ['New UseCase']);

      const useCase = await useCaseDomain.loadUseCaseBy({
        name: 'New UseCase',
      });
      expect(useCase).toBeUndefined();

      const links = await TestHelper.objectUseCase.load({
        object_id: objectId,
      });
      expect(links).toHaveLength(0);
    });

    it('should reuse an existing use case (case-insensitive) instead of duplicating it', async () => {
      const existingUseCase = await useCaseDomain.insertUseCase({
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
      const objectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseDomain.insertUseCase({
        name: 'UseCase A',
        color: '#111111',
      });
      await useCaseDomain.insertUseCase({
        name: 'UseCase B',
        color: '#222222',
      });

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
      const firstObjectId = uuidv4() as ObjectUseCaseObjectId;
      const secondObjectId = uuidv4() as ObjectUseCaseObjectId;

      await useCaseDomain.insertUseCase({
        name: 'Shared UseCase',
        color: '#0099cc',
      });

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
      const useCase1 = await useCaseDomain.insertUseCase({
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
      const created = await useCaseDomain.insertUseCase({
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
