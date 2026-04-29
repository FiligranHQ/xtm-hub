import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useRegisteredPlatformsFragment$key } from '@generated/useRegisteredPlatformsFragment.graphql';
import { useRegisteredPlatformsFragmentQuery } from '@generated/useRegisteredPlatformsFragmentQuery.graphql';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

export const UseRegisteredPlatformsFragment = graphql`
  fragment useRegisteredPlatformsFragment on RegisteredPlatform {
    id
    version
    title
    url
  }
`;

export const UseRegisteredPlatformsQuery = graphql`
  query useRegisteredPlatformsFragmentQuery($input: RegisteredPlatformsInput!) {
    registeredPlatforms(input: $input) {
      ...useRegisteredPlatformsFragment
    }
  }
`;

interface UseRegisteredPlatformsOptions {
  onlyActive?: boolean;
}

export const useRegisteredPlatforms = (
  platformIdentifier: PlatformIdentifierEnum,
  options: UseRegisteredPlatformsOptions = {}
) => {
  const { onlyActive = false } = options;
  const queryData = useLazyLoadQuery<useRegisteredPlatformsFragmentQuery>(
    UseRegisteredPlatformsQuery,
    {
      input: {
        identifier: platformIdentifier,
        onlyActive,
      },
    }
  );
  const platforms = queryData.registeredPlatforms.map((instanceRef) =>
    useFragment<useRegisteredPlatformsFragment$key>(
      UseRegisteredPlatformsFragment,
      instanceRef
    )
  );

  return {
    platforms,
  };
};
