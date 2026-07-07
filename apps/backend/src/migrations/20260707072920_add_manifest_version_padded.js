const CONNECTOR_VERSION_REGEX = /^(\d+)\.(\d{1,6})\.(\d+)(?:-lts\.(\d+))?$/i;

/**
 * Mirrors src/modules/shareable-resource/manifest-fragment/manifest-fragment.utils.ts#formatConnectorVersion.
 * Duplicated here since migrations do not import application source code.
 * @param {string} version
 * @returns {string}
 */
function formatConnectorVersion(version) {
  const match = version.match(CONNECTOR_VERSION_REGEX);
  if (!match) {
    throw new Error(`Invalid connector version format: ${version}`);
  }

  const major = (match[1] ?? '0').padStart(3, '0');
  const datePart = (match[2] ?? '0').padStart(6, '0');
  const patch = (match[3] ?? '0').padStart(3, '0');

  const hasLtsSuffix = /-lts/i.test(version);
  if (!hasLtsSuffix) {
    return `${major}.${datePart}.${patch}`;
  }

  const ltsPatch = (match[4] ?? '0').padStart(3, '0');
  return `${major}.${datePart}.${patch}.LTS.${ltsPatch}`;
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.table('Manifest', (table) => {
    table.text('version_padded');
  });

  // Backfill existing rows. Only ManifestType.Connector is supported today,
  // so every existing row's version is a connector version string.
  // Updates are run in bounded-size chunks (concurrently within a chunk,
  // sequentially across chunks) to avoid one UPDATE per row in series.
  const manifests = await knex('Manifest').select('id', 'version');
  const BATCH_SIZE = 200;
  for (let i = 0; i < manifests.length; i += BATCH_SIZE) {
    const batch = manifests.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map((manifest) =>
        knex('Manifest')
          .where('id', manifest.id)
          .update({ version_padded: formatConnectorVersion(manifest.version) })
      )
    );
  }

  await knex.schema.alterTable('Manifest', (table) => {
    table.text('version_padded').notNullable().alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.table('Manifest', (table) => {
    table.dropColumn('version_padded');
  });
}
