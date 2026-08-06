const THIRD_PARTY_INTEGRATION_SUBTYPE_TO_SOLUTION_CATEGORY = {
  ORCHESTRATION: 'SOAR & Security Automation',
  DETECTION: 'Endpoint Detection & Response',
  CASE_MANAGEMENT: 'Incident Response & Case Management',
  OTHER: 'Incident Response & Case Management',
};

const TARGET_SUBTYPES = Object.keys(
  THIRD_PARTY_INTEGRATION_SUBTYPE_TO_SOLUTION_CATEGORY
);
const TARGET_SOLUTION_CATEGORY_NAMES = Array.from(
  new Set(Object.values(THIRD_PARTY_INTEGRATION_SUBTYPE_TO_SOLUTION_CATEGORY))
);

const loadThirdPartyIntegrationSubtypes = (knex) =>
  knex('Document_Metadata as dm_sub')
    .join(
      'Document_Metadata as dm_type',
      'dm_sub.document_id',
      'dm_type.document_id'
    )
    .join('Document as d', 'd.id', 'dm_sub.document_id')
    .where('dm_sub.key', 'integration_subtype')
    .whereIn('dm_sub.value', TARGET_SUBTYPES)
    .andWhere('dm_type.key', 'integration_type')
    .andWhere('dm_type.value', 'third_party_integration')
    .andWhere('d.type', 'opencti_integration')
    .select('dm_sub.document_id', 'dm_sub.value as subtype');

const loadTargetSolutionCategories = (knex) =>
  knex('SolutionCategory')
    .whereIn('name', TARGET_SOLUTION_CATEGORY_NAMES)
    .select('id', 'name');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  const targetSolutionCategories = await loadTargetSolutionCategories(knex);
  if (targetSolutionCategories.length === 0) {
    return;
  }

  const solutionCategoryIdByName = new Map(
    targetSolutionCategories.map((category) => [category.name, category.id])
  );
  const thirdPartyIntegrationSubtypes =
    await loadThirdPartyIntegrationSubtypes(knex);

  if (thirdPartyIntegrationSubtypes.length === 0) {
    return;
  }

  const documentIds = Array.from(
    new Set(thirdPartyIntegrationSubtypes.map((row) => row.document_id))
  );

  await knex('Object_SolutionCategory')
    .whereIn('object_id', documentIds)
    .delete();

  const objectSolutionCategories = thirdPartyIntegrationSubtypes
    .map((row) => {
      const solutionCategoryName =
        THIRD_PARTY_INTEGRATION_SUBTYPE_TO_SOLUTION_CATEGORY[row.subtype];
      const solutionCategoryId =
        solutionCategoryIdByName.get(solutionCategoryName);

      if (!solutionCategoryId) {
        return null;
      }

      return {
        object_id: row.document_id,
        solution_category_id: solutionCategoryId,
      };
    })
    .filter(Boolean);

  if (objectSolutionCategories.length > 0) {
    await knex('Object_SolutionCategory')
      .insert(objectSolutionCategories)
      .onConflict(['object_id', 'solution_category_id'])
      .ignore();
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  const targetSolutionCategories = await loadTargetSolutionCategories(knex);
  if (targetSolutionCategories.length === 0) {
    return;
  }

  const thirdPartyIntegrationSubtypes =
    await loadThirdPartyIntegrationSubtypes(knex);
  if (thirdPartyIntegrationSubtypes.length === 0) {
    return;
  }

  const documentIds = Array.from(
    new Set(thirdPartyIntegrationSubtypes.map((row) => row.document_id))
  );
  const solutionCategoryIds = targetSolutionCategories.map(
    (category) => category.id
  );

  await knex('Object_SolutionCategory')
    .whereIn('object_id', documentIds)
    .whereIn('solution_category_id', solutionCategoryIds)
    .delete();
}
