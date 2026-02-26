import { afterEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import {
  EpicOrdering,
  FiligranProduct,
  OrderingMode,
  Timeline,
} from '../../../__generated__/resolvers-types';
import Epic, { EpicId } from '../../../model/kanel/public/Epic';
import { EpicApp } from './epic.app';

describe('EpicApp', () => {
  afterEach(async () => {
    // Clean up the Epic table before each test
    await db('Epic').delete();
  });

  describe('createEpic', () => {
    it('should createEpic with correct data and return the created epic', async () => {
      const input = {
        epic: 'EPI-001',
        title: 'Test Epic',
        short_description: 'Short desc',
        long_description: 'Long description for the epic',
        is_active: true,
        product: FiligranProduct.OpenCti,
        timeline: Timeline.Now,
      };

      const createdEpic = await EpicApp.createEpic(input);

      expect(createdEpic).toBeDefined();
      expect(createdEpic.id).toBeDefined();
      expect(createdEpic.epic).toBe('EPI-001');
      expect(createdEpic.title).toBe('Test Epic');
      expect(createdEpic.product).toBe('OpenCTI');
      expect(createdEpic.is_active).toBe(true);

      // Verify in DB
      const dbEpic = await db<Epic>('Epic').where('id', createdEpic.id).first();
      expect(dbEpic).toBeDefined();
      expect(dbEpic?.epic).toBe('EPI-001');
      expect(dbEpic?.title).toBe('Test Epic');
    });
  });

  describe('updateEpic', () => {
    it('should update the specified epic with the provided data and return the updated epic', async () => {
      // Create an epic first
      const createdEpic = await EpicApp.createEpic({
        epic: 'EPI-003',
        title: 'Original Title',
        short_description: 'Original short',
        long_description: 'Original long',
        product: FiligranProduct.OpenAev,
        timeline: Timeline.Next,
      });

      // Update it
      const updateInput = {
        title: 'Updated Title',
        short_description: 'Updated short description',
        is_active: true,
      };

      const updatedEpic = await EpicApp.updateEpic(
        createdEpic.id as EpicId,
        updateInput
      );

      expect(updatedEpic).toBeDefined();
      expect(updatedEpic?.title).toBe('Updated Title');
      expect(updatedEpic?.short_description).toBe('Updated short description');
      expect(updatedEpic?.is_active).toBe(true);
      // Original values should be preserved
      expect(updatedEpic?.epic).toBe('EPI-003');
      expect(updatedEpic?.long_description).toBe('Original long');

      // Verify in DB
      const dbEpic = await db<Epic>('Epic')
        .where('title', 'Updated Title')
        .first();
      expect(dbEpic?.title).toBe('Updated Title');
      expect(dbEpic?.is_active).toBe(true);
    });
  });

  describe('deleteEpic', () => {
    it('should delete the specified epic and return the deleted epic', async () => {
      const createdEpic = await EpicApp.createEpic({
        epic: 'EPI-005',
        title: 'Epic to Delete',
        short_description: 'Short',
        long_description: 'Long',
        product: FiligranProduct.OpenCti,
        timeline: Timeline.Next,
      });

      expect(createdEpic.id).toBeDefined();

      // Delete the epic
      const deletedEpic = await EpicApp.deleteEpic(createdEpic.id as EpicId);

      expect(deletedEpic).toBeDefined();
      expect(deletedEpic?.id).toBe(createdEpic.id);
      expect(deletedEpic?.epic).toBe('EPI-005');
    });
  });

  describe('loadEpics', () => {
    it('should return epics with pagination information using first and orderBy parameters', async () => {
      // Create multiple epics
      await EpicApp.createEpic({
        epic: 'EPI-006',
        title: 'Epic 1',
        short_description: 'Short 1',
        long_description: 'Long 1',
        product: FiligranProduct.XtmHub,
        timeline: Timeline.Now,
        is_active: true,
      });

      await EpicApp.createEpic({
        epic: 'EPI-007',
        title: 'Epic 2',
        short_description: 'Short 2',
        long_description: 'Long 2',
        product: FiligranProduct.XtmHub,
        timeline: Timeline.Now,
        is_active: true,
      });

      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Epic,
        orderMode: OrderingMode.Asc,
      });

      expect(epicsConnection).toBeDefined();
      expect(epicsConnection.edges.length).toStrictEqual(2);
      expect(epicsConnection.pageInfo).toBeDefined();
      expect(epicsConnection.pageInfo.hasNextPage).toBeDefined();
      expect(epicsConnection.pageInfo.hasPreviousPage).toBeDefined();
      expect(
        epicsConnection.edges.some((e) => e.node.epic === 'EPI-006')
      ).toBeTruthy();
      expect(
        epicsConnection.edges.some((e) => e.node.epic === 'EPI-007')
      ).toBeTruthy();
    });

    it('should return empty connection when no epics exist', async () => {
      const epicsConnection = await EpicApp.loadEpics({
        first: 10,
        orderBy: EpicOrdering.Epic,
        orderMode: OrderingMode.Asc,
      });

      expect(epicsConnection).toBeDefined();
      expect(epicsConnection.edges.length).toStrictEqual(0);
      expect(epicsConnection.pageInfo).toBeDefined();
    });
  });
});
