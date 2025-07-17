import { publicServiceList_services$data } from '@generated/publicServiceList_services.graphql';

export type PublicService =
  publicServiceList_services$data['publicServiceInstances']['edges'][number]['node'];

export enum JOIN_TYPE {
  JOIN_INVITE = 'JOIN_INVITE',
  JOIN_ASK = 'JOIN_ASK',
  JOIN_AUTO = 'JOIN_AUTO',
  JOIN_SELF = 'JOIN_SELF',
}

export enum SERVICE_CREATION_STATUS {
  PENDING = 'PENDING',
  CREATED = 'CREATED',
}
