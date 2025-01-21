import { publicServiceList_services$data } from '../../../__generated__/publicServiceList_services.graphql';

export type PublicService =
  publicServiceList_services$data['publicServices']['edges'][number]['node'];

export const JOIN_TYPE = {
  JOIN_INVITE: 'JOIN_INVITE',
  JOIN_ASK: 'JOIN_ASK',
  JOIN_AUTO: 'JOIN_AUTO',
  JOIN_SELF: 'JOIN_SELF',
};
