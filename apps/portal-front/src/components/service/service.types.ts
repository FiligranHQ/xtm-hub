import { publicServiceList_services$data } from '@generated/publicServiceList_services.graphql';

export type PublicService =
  publicServiceList_services$data['publicServiceInstances']['edges'][number]['node'];
