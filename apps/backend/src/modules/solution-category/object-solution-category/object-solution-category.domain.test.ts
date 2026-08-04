import { v4 as uuidv4 } from 'uuid';
import { afterEach, describe, expect, it } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import { solutionCategoryDomain } from '../solution-category.domain';
import { objectSolutionCategoryDomain } from './object-solution-category.domain';

describe('object-solution-category.domain', () => {
  const createdCategoryIds: string[] = [];

  afterEach(async () => {
    await TestHelper.objectSolutionCategory.delete({});
    await TestHelper.document.delete({});
    for (const categoryId of createdCategoryIds.splice(0)) {
      await solutionCategoryDomain.deleteSolutionCategory({
        id: categoryId,
      });
    }
  });

  it('should insert an object solution category link', async () => {
    // Given
    const document = await TestHelper.document.create();
    const solutionCategory =
      await solutionCategoryDomain.insertSolutionCategory({
        name: `solution-category-${uuidv4()}`,
      });
    createdCategoryIds.push(solutionCategory.id);

    // When
    await objectSolutionCategoryDomain.insertObjectSolutionCategory({
      object_id: document.id,
      solution_category_id: solutionCategory.id,
    });

    // Then
    const links = await TestHelper.objectSolutionCategory.load({
      object_id: document.id,
      solution_category_id: solutionCategory.id,
    });
    expect(links).toHaveLength(1);
  });

  it('should delete object solution category links by field', async () => {
    // Given
    const document = await TestHelper.document.create();
    const otherDocument = await TestHelper.document.create();
    const solutionCategoryA =
      await solutionCategoryDomain.insertSolutionCategory({
        name: `solution-category-a-${uuidv4()}`,
      });
    createdCategoryIds.push(solutionCategoryA.id);
    const solutionCategoryB =
      await solutionCategoryDomain.insertSolutionCategory({
        name: `solution-category-b-${uuidv4()}`,
      });
    createdCategoryIds.push(solutionCategoryB.id);
    const solutionCategoryOther =
      await solutionCategoryDomain.insertSolutionCategory({
        name: `solution-category-other-${uuidv4()}`,
      });
    createdCategoryIds.push(solutionCategoryOther.id);

    await objectSolutionCategoryDomain.insertObjectSolutionCategory({
      object_id: document.id,
      solution_category_id: solutionCategoryA.id,
    });
    await objectSolutionCategoryDomain.insertObjectSolutionCategory({
      object_id: document.id,
      solution_category_id: solutionCategoryB.id,
    });
    await objectSolutionCategoryDomain.insertObjectSolutionCategory({
      object_id: otherDocument.id,
      solution_category_id: solutionCategoryOther.id,
    });

    // When
    await objectSolutionCategoryDomain.deleteObjectSolutionCategoryBy({
      object_id: document.id,
    });

    // Then
    const deletedLinks = await TestHelper.objectSolutionCategory.load({
      object_id: document.id,
    });
    const keptLinks = await TestHelper.objectSolutionCategory.load({
      object_id: otherDocument.id,
    });
    expect(deletedLinks).toHaveLength(0);
    expect(keptLinks).toHaveLength(1);
  });
});
