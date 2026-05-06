/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async (knex) => {
  await knex('DeploymentRequest')
    .whereIn('cancellation_reason', [
      'Intelligence lacks actionable insight for our specific needs',
      'Incompatible with our existing security stack',
      'Configuration is too complex to complete within a reasonable timeframe',
      'Internal security or legal team required immediate termination',
      'We lack the internal analysts/expertise to utilise the tool effectively',
      'Other',
    ])
    .update({
      cancellation_reason: knex.raw(`CASE
        WHEN cancellation_reason = 'Intelligence lacks actionable insight for our specific needs' THEN 'value'
        WHEN cancellation_reason = 'Incompatible with our existing security stack' THEN 'compatibility'
        WHEN cancellation_reason = 'Configuration is too complex to complete within a reasonable timeframe' THEN 'complexity'
        WHEN cancellation_reason = 'Internal security or legal team required immediate termination' THEN 'legal-security'
        WHEN cancellation_reason = 'We lack the internal analysts/expertise to utilise the tool effectively' THEN 'expertise'
        WHEN cancellation_reason = 'Other' THEN 'other'
        ELSE cancellation_reason
      END`),
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async (knex) => {
  await knex('DeploymentRequest')
    .whereIn('cancellation_reason', [
      'value',
      'compatibility',
      'complexity',
      'legal-security',
      'expertise',
      'other',
    ])
    .update({
      cancellation_reason: knex.raw(`CASE
        WHEN cancellation_reason = 'value' THEN 'Intelligence lacks actionable insight for our specific needs'
        WHEN cancellation_reason = 'compatibility' THEN 'Incompatible with our existing security stack'
        WHEN cancellation_reason = 'complexity' THEN 'Configuration is too complex to complete within a reasonable timeframe'
        WHEN cancellation_reason = 'legal-security' THEN 'Internal security or legal team required immediate termination'
        WHEN cancellation_reason = 'expertise' THEN 'We lack the internal analysts/expertise to utilise the tool effectively'
        WHEN cancellation_reason = 'other' THEN 'Other'
        ELSE cancellation_reason
      END`),
    });
};
