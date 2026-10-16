import { Knex } from 'knex';
import { dbRaw, KnexQueryBuilder } from '../../../knexfile';
import { ServiceDefinitionIdentifier } from '../../__generated__/resolvers-types';
import { requestContext } from '../../context/request.context';
import { isUserAdminPlatform } from '../access';

/** Libraries that stay out of navigation and routes until they hold a published resource. */
export const SERVICE_DEFINITIONS_LISTED_ONCE_PUBLISHED: readonly ServiceDefinitionIdentifier[] =
  [ServiceDefinitionIdentifier.OpenctiHuntPacks];

export const applyServiceInstanceVisibility = (
  builder: Knex.QueryBuilder,
  serviceInstanceRef: string
) => {
  const user = requestContext.get()?.user;

  builder.where(`${serviceInstanceRef}.public`, '=', true);

  if (!user) {
    return;
  }

  builder.orWhereExists(function () {
    this.select(dbRaw('1'))
      .from('Subscription as securitySubscription')
      .whereRaw('??.service_instance_id = ??.id', [
        'securitySubscription',
        serviceInstanceRef,
      ])
      .andWhere(
        'securitySubscription.organization_id',
        user.selected_organization_id
      );
  });
};

export const restrictServiceInstanceToPublic = (
  qb: KnexQueryBuilder,
  serviceInstanceRef: string = 'ServiceInstance'
) => {
  qb.where(`${serviceInstanceRef}.public`, '=', true);

  return qb;
};

export const restrictServiceInstanceToAccessible = (qb: KnexQueryBuilder) =>
  qb.where(function () {
    applyServiceInstanceVisibility(this, 'ServiceInstance');
  });

/**
 * Hides a library listed once published while it holds no active resource,
 * for every user, platform administrators included.
 */
export const restrictServiceInstanceToListedForEveryone = (
  qb: KnexQueryBuilder
) =>
  qb.where(function () {
    this.whereNotExists(function () {
      this.select(dbRaw('1'))
        .from('ServiceDefinition as listingDefinition')
        .whereRaw('??.id = ??.service_definition_id', [
          'listingDefinition',
          'ServiceInstance',
        ])
        .whereIn(
          'listingDefinition.identifier',
          SERVICE_DEFINITIONS_LISTED_ONCE_PUBLISHED
        );
    }).orWhereExists(function () {
      this.select(dbRaw('1'))
        .from('Document as publishedDocument')
        .whereRaw('??.service_instance_id = ??.id', [
          'publishedDocument',
          'ServiceInstance',
        ])
        .andWhere('publishedDocument.active', '=', true)
        .whereNotExists(function () {
          this.select(dbRaw('1'))
            .from('Document_Children as publishedDocumentChild')
            .whereRaw('??.child_document_id = ??.id', [
              'publishedDocumentChild',
              'publishedDocument',
            ]);
        });
    });
  });

/**
 * Hides a library listed once published while it holds no active resource.
 * Platform administrators still reach it, as they publish its first resource.
 */
export const restrictServiceInstanceToListed = (qb: KnexQueryBuilder) => {
  const user = requestContext.get()?.user;
  if (user && isUserAdminPlatform(user)) {
    return qb;
  }

  return restrictServiceInstanceToListedForEveryone(qb);
};
