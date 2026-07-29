import { v4 as uuidv4 } from 'uuid';
import { describe, expect, it, vi } from 'vitest';
import { FiligranProduct } from '../../__generated__/resolvers-types';
import SolutionCategory, {
  SolutionCategoryId,
} from '../../model/kanel/public/SolutionCategory';
import { ErrorCode } from '../../utils/error/error.code';
import { solutionCategoryApp } from './solution-category.app';
import { solutionCategoryDomain } from './solution-category.domain';

describe('solution-category.app', () => {
  it('should edit a solution category by id', async () => {
    // Given
    const id = uuidv4() as SolutionCategoryId;
    const expected = {
      id,
      name: 'Updated Name',
      product: [FiligranProduct.Opencti],
    } as SolutionCategory;
    vi.spyOn(
      solutionCategoryDomain,
      'updateSolutionCategory'
    ).mockResolvedValue(expected);

    // When
    const result = await solutionCategoryApp.editSolutionCategoryById(id, {
      name: 'Updated Name',
    });

    // Then
    expect(solutionCategoryDomain.updateSolutionCategory).toHaveBeenCalledWith(
      id,
      { name: 'Updated Name' }
    );
    expect(result).toEqual(expected);
  });

  it('should throw when editing a non-existing solution category', async () => {
    // Given
    const id = uuidv4() as SolutionCategoryId;
    vi.spyOn(
      solutionCategoryDomain,
      'updateSolutionCategory'
    ).mockResolvedValue(undefined);

    // Then
    await expect(
      solutionCategoryApp.editSolutionCategoryById(id, { name: 'Updated Name' })
    ).rejects.toThrow(ErrorCode.SolutionCategoryNotFound);
  });

  it('should delete a solution category by id', async () => {
    // Given
    const id = uuidv4() as SolutionCategoryId;
    const expected = {
      id,
      name: 'Category',
      product: [FiligranProduct.Opencti],
    } as SolutionCategory;

    vi.spyOn(
      solutionCategoryDomain,
      'deleteSolutionCategory'
    ).mockResolvedValue(expected);

    // When
    const result = await solutionCategoryApp.deleteSolutionCategoryBy({ id });

    // Then
    expect(solutionCategoryDomain.deleteSolutionCategory).toHaveBeenCalledWith({
      id,
    });
    expect(result).toEqual(expected);
  });

  it('should throw when deleting a non-existing solution category', async () => {
    // Given
    const id = uuidv4() as SolutionCategoryId;
    vi.spyOn(
      solutionCategoryDomain,
      'deleteSolutionCategory'
    ).mockResolvedValue(undefined);

    // Then
    await expect(
      solutionCategoryApp.deleteSolutionCategoryBy({ id })
    ).rejects.toThrow(ErrorCode.SolutionCategoryNotFound);
  });
});
