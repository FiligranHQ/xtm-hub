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

export const useRegisteredPlatforms = (
  platformIdentifier: PlatformIdentifierEnum
) => {
  const queryData = useLazyLoadQuery<useRegisteredPlatformsFragmentQuery>(
    UseRegisteredPlatformsQuery,
    {
      input: {
        identifier: platformIdentifier,
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
