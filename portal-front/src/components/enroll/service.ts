import enrollCanEnrollOCTIInstanceFragmentGraphql, {
  enrollCanEnrollOCTIInstanceFragment$data,
  enrollCanEnrollOCTIInstanceFragment$key,
} from '@generated/enrollCanEnrollOCTIInstanceFragment.graphql';
import enrollCanEnrollOCTIInstanceQueryGraphql, {
  enrollCanEnrollOCTIInstanceQuery,
} from '@generated/enrollCanEnrollOCTIInstanceQuery.graphql';
import { useFragment, useLazyLoadQuery } from 'react-relay';

interface CanEnrollOCTIInstanceQueryParams {
  organizationId?: string;
  platformId: string;
}

export const canEnrollOCTIInstance = ({
  organizationId,
  platformId,
}: CanEnrollOCTIInstanceQueryParams):
  | enrollCanEnrollOCTIInstanceFragment$data
  | undefined
  | null => {
  const data = useLazyLoadQuery<enrollCanEnrollOCTIInstanceQuery>(
    enrollCanEnrollOCTIInstanceQueryGraphql,
    {
      input: {
        organizationId: organizationId ?? '',
        platformId,
      },
      skip: !organizationId,
    }
  );

  return useFragment<enrollCanEnrollOCTIInstanceFragment$key>(
    enrollCanEnrollOCTIInstanceFragmentGraphql,
    data.canEnrollOCTIInstance
  );
};
