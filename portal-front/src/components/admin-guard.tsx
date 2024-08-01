'use client';

import * as React from 'react';
import useGranted from '@/hooks/useGranted';
import {Restriction} from '../../__generated__/meContext_fragment.graphql';

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
  const authorized = capacityRestriction.some(useGranted);
  if (!authorized && displayError) {
    return (
      <>
        <h1>Error</h1>You are not authorized to get this page.
      </>
    );
  } else if (!authorized) {
    return <></>;
  }
  return <>{children}</>;
};

export default GuardCapacityComponent;
