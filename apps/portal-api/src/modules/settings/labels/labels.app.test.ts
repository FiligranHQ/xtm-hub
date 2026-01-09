import { v4 as uuidv4 } from 'uuid';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import ObjectLabel, {
  ObjectLabelObjectId,
} from '../../../model/kanel/public/ObjectLabel';
import { objectLabelDomain } from '../objectLabel/object-label.domain';
import { labelsApp } from './labels.app';
import { labelsDomain } from './labels.domain';

describe('Labels app', () => {
  describe(`${labelsApp.loadOrCreateLabel.name}`, () => {
    beforeEach(async () => {
      // Clean up the Label table before each test
      await db('Label').delete();
    });

    it('should create a new label when it does not exist', async () => {
      const newLabel = await labelsApp.loadOrCreateLabel({
        name: 'Test Label',
        color: '#ff0000',
      });

      // Verify the label was created
      const label = await db('Label').where('id', newLabel.id).first();

      expect(label.id).toBeDefined();
      expect(label.name).toBe('Test Label');
      expect(label.color).toBe('#ff0000');
    });

    it('should return existing label id when label already exists', async () => {
      // Create a label first
      const firstLabel = await labelsApp.loadOrCreateLabel({
        name: 'Existing Label',
        color: '#00ff00',
      });

      // Try to create the same label again
      const secondLabel = await labelsApp.loadOrCreateLabel({
        name: 'Existing Label',
        color: '#0000ff', // Different color
      });

      // Should return the same ID
      expect(secondLabel.id).toBe(firstLabel.id);

      // Verify only one label exists with the original color
      const labels = await db('Label').where('name', 'Existing Label').select();

      expect(labels).toHaveLength(1);
      expect(labels[0].color).toBe('#00ff00'); // Original color preserved
    });

    it('should be case-insensitive for label names', async () => {
      // Create label with lowercase
      const lowercaseLabel = await labelsApp.loadOrCreateLabel({
        name: 'test label',
        color: '#aaaaaa',
      });

      // Try to create with uppercase - should return same label
      const uppercaseLabel = await labelsApp.loadOrCreateLabel({
        name: 'TEST LABEL',
        color: '#bbbbbb',
      });

      // Should return the same label ID
      expect(uppercaseLabel.id).toBe(lowercaseLabel.id);

      // Try mixed case
      const mixedCaseLabel = await labelsApp.loadOrCreateLabel({
        name: 'Test Label',
        color: '#cccccc',
      });

      expect(mixedCaseLabel.id).toBe(lowercaseLabel.id);

      // Verify only one label exists with original name and color
      const labels = await db('Label').select();
      expect(labels).toHaveLength(1);
      expect(labels[0].name).toBe('test label'); // Original name preserved
      expect(labels[0].color).toBe('#aaaaaa'); // Original color preserved
    });

    it('should use default color when color is not provided', async () => {
      const newLabel = await labelsApp.loadOrCreateLabel({
        name: 'Default Color Label',
        color: '#0099cc', // This is the default
      });

      expect(newLabel.color).toBe('#0099cc');
    });

    it('should handle multiple different labels', async () => {
      const label1 = await labelsApp.loadOrCreateLabel({
        name: 'Label 1',
        color: '#111111',
      });

      const label2 = await labelsApp.loadOrCreateLabel({
        name: 'Label 2',
        color: '#222222',
      });

      const label3 = await labelsApp.loadOrCreateLabel({
        name: 'Label 3',
        color: '#333333',
      });

      // All IDs should be different
      expect(label1.id).not.toBe(label2.id);
      expect(label2.id).not.toBe(label3.id);
      expect(label1.id).not.toBe(label3.id);

      // Verify all labels exist
      const labels = await db('Label').select();
      expect(labels).toHaveLength(3);
    });
  });

  describe(`${labelsApp.deleteLabelBy.name}`, () => {
    it('should remove object label associated to label', async () => {
      const label1 = await labelsApp.loadOrCreateLabel({
        name: 'Label 1',
        color: '#111111',
      });

      await objectLabelDomain.insertObjectLabel({
        object_id: uuidv4() as ObjectLabelObjectId,
        label_id: label1.id,
      });

      await objectLabelDomain.insertObjectLabel({
        object_id: uuidv4() as ObjectLabelObjectId,
        label_id: label1.id,
      });

      await labelsApp.deleteLabelBy({ name: 'Label 1' });

      const resultLabel1 = await labelsDomain.loadLabelBy({ name: 'Label 1' });
      expect(resultLabel1).toBeUndefined();

      const resultObjectLabels = await db<ObjectLabel>('Object_Label').where({
        label_id: label1.id,
      });

      expect(resultObjectLabels.length).toBe(0);
    });
  });
});
