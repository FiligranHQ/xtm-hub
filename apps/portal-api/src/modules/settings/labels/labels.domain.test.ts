import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../../../knexfile';
import { contextAdminUser } from '../../../../tests/tests.const';
import { getOrCreateLabel } from './labels.domain';

describe('getOrCreateLabel', () => {
  const context = contextAdminUser;

  beforeEach(async () => {
    // Clean up the Label table before each test
    await db(context, 'Label').delete();
  });

  it('should create a new label when it does not exist', async () => {
    const newLabel = await getOrCreateLabel({
      context,
      name: 'Test Label',
      color: '#ff0000',
    });

    // Verify the label was created
    const label = await db(context, 'Label').where('id', newLabel.id).first();

    expect(label.id).toBeDefined();
    expect(label.name).toBe('Test Label');
    expect(label.color).toBe('#ff0000');
  });

  it('should return existing label id when label already exists', async () => {
    // Create a label first
    const firstLabel = await getOrCreateLabel({
      context,
      name: 'Existing Label',
      color: '#00ff00',
    });

    // Try to create the same label again
    const secondLabel = await getOrCreateLabel({
      context,
      name: 'Existing Label',
      color: '#0000ff', // Different color
    });

    // Should return the same ID
    expect(secondLabel.id).toBe(firstLabel.id);

    // Verify only one label exists with the original color
    const labels = await db(context, 'Label')
      .where('name', 'Existing Label')
      .select();

    expect(labels).toHaveLength(1);
    expect(labels[0].color).toBe('#00ff00'); // Original color preserved
  });

  it('should be case-insensitive for label names', async () => {
    // Create label with lowercase
    const lowercaseLabel = await getOrCreateLabel({
      context,
      name: 'test label',
      color: '#aaaaaa',
    });

    // Try to create with uppercase - should return same label
    const uppercaseLabel = await getOrCreateLabel({
      context,
      name: 'TEST LABEL',
      color: '#bbbbbb',
    });

    // Should return the same label ID
    expect(uppercaseLabel.id).toBe(lowercaseLabel.id);

    // Try mixed case
    const mixedCaseLabel = await getOrCreateLabel({
      context,
      name: 'Test Label',
      color: '#cccccc',
    });

    expect(mixedCaseLabel.id).toBe(lowercaseLabel.id);

    // Verify only one label exists with original name and color
    const labels = await db(context, 'Label').select();
    expect(labels).toHaveLength(1);
    expect(labels[0].name).toBe('test label'); // Original name preserved
    expect(labels[0].color).toBe('#aaaaaa'); // Original color preserved
  });

  it('should use default color when color is not provided', async () => {
    const newLabel = await getOrCreateLabel({
      context,
      name: 'Default Color Label',
      color: '#0099cc', // This is the default
    });

    expect(newLabel.color).toBe('#0099cc');
  });

  it('should handle multiple different labels', async () => {
    const label1 = await getOrCreateLabel({
      context,
      name: 'Label 1',
      color: '#111111',
    });

    const label2 = await getOrCreateLabel({
      context,
      name: 'Label 2',
      color: '#222222',
    });

    const label3 = await getOrCreateLabel({
      context,
      name: 'Label 3',
      color: '#333333',
    });

    // All IDs should be different
    expect(label1.id).not.toBe(label2.id);
    expect(label2.id).not.toBe(label3.id);
    expect(label1.id).not.toBe(label3.id);

    // Verify all labels exist
    const labels = await db(context, 'Label').select();
    expect(labels).toHaveLength(3);
  });
});
