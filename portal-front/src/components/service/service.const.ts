import { publicServiceList_services$data } from '../../../__generated__/publicServiceList_services.graphql';

export type PublicService =
  publicServiceList_services$data['publicServiceInstances']['edges'][number]['node'];

export const JOIN_TYPE = {
  JOIN_INVITE: 'JOIN_INVITE',
  JOIN_ASK: 'JOIN_ASK',
  JOIN_AUTO: 'JOIN_AUTO',
  JOIN_SELF: 'JOIN_SELF',
};

export const SERVICE_DEFINITION_IDENTIFIER = {
  LINK: 'link',
  VAULT: 'vault',
  CUSTOM_DASHBOARDS: 'custom_dashboards',
};

export const SERVICE_CREATION_STATUS = {
  PENDING: 'PENDING',
  CREATED: 'CREATED',
};
