import enrollCanEnrollOCTIInstanceQueryGraphql, {
  enrollCanEnrollOCTIInstanceQuery,
  enrollCanEnrollOCTIInstanceQuery$data,
} from '@generated/enrollCanEnrollOCTIInstanceQuery.graphql';
import { useLazyLoadQuery } from 'react-relay';

interface CanEnrollOCTIInstanceQueryParams {
  organizationId?: string;
  platformId: string;
}

export const canEnrollOCTIInstance = ({
  organizationId,
  platformId,
}: CanEnrollOCTIInstanceQueryParams):
  | enrollCanEnrollOCTIInstanceQuery$data['canEnrollOCTIInstance']
  | undefined => {
  const canEnrollData = useLazyLoadQuery<enrollCanEnrollOCTIInstanceQuery>(
    enrollCanEnrollOCTIInstanceQueryGraphql,
    {
      input: {
        organizationId: organizationId ?? '',
        platformId,
      },
      skip: !organizationId,
    }
  );

  return canEnrollData.canEnrollOCTIInstance;
};
