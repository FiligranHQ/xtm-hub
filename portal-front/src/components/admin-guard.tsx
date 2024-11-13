'use client';

import Loader from '@/components/loader';
import { Portal, portalContext } from '@/components/portal-context';
import useGranted from '@/hooks/useGranted';
import * as React from 'react';
import { useContext } from 'react';
import { Restriction } from '../../__generated__/meContext_fragment.graphql';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction: Restriction[];
  displayError?: boolean;
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction,
  displayError = true,
}) => {
  const { me } = useContext<Portal>(portalContext);
  if (!me) {
    return <Loader />;
  }
  const authorized = capacityRestriction.some(useGranted);
  if (!authorized && displayError) {
    return (
      <>
        <h2 className={'txt-title'}>Error</h2>You are not authorized to get this
        page.
      </>
    );
  } else if (!authorized) {
    return null;
  }
  return <>{children}</>;
};

export default GuardCapacityComponent;
