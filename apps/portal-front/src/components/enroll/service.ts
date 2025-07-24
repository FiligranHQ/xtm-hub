import enrollCanEnrollOCTIPlatformFragmentGraphql, {
  enrollCanEnrollOCTIPlatformFragment$data,
  enrollCanEnrollOCTIPlatformFragment$key,
} from '@generated/enrollCanEnrollOCTIPlatformFragment.graphql';
import enrollCanEnrollOCTIPlatformQueryGraphql, {
  enrollCanEnrollOCTIPlatformQuery,
} from '@generated/enrollCanEnrollOCTIPlatformQuery.graphql';
import { useFragment, useLazyLoadQuery } from 'react-relay';

interface CanEnrollOCTIPlatformQueryParams {
  organizationId?: string;
  platformId: string;
}

export const useCanEnrollOCTIPlatform = ({
  organizationId,
  platformId,
}: CanEnrollOCTIPlatformQueryParams):
  | enrollCanEnrollOCTIPlatformFragment$data
  | undefined
  | null => {
  const data = useLazyLoadQuery<enrollCanEnrollOCTIPlatformQuery>(
    enrollCanEnrollOCTIPlatformQueryGraphql,
    {
      input: {
        organizationId: organizationId ?? '',
        platformId,
      },
      skip: !organizationId,
    }
  );

  return useFragment<enrollCanEnrollOCTIPlatformFragment$key>(
    enrollCanEnrollOCTIPlatformFragmentGraphql,
    data.canEnrollOCTIPlatform
  );
};
