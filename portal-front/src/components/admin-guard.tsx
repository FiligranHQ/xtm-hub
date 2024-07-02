'use client';

import * as React from 'react';
import useGranted from '@/hooks/useGranted';
import {Restriction} from '../../__generated__/meContext_fragment.graphql';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction: Restriction[];
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction,
}) => {
  const authorized = capacityRestriction.every(useGranted);
  if (authorized === false) {
    return (
      <>
        <h1>Error</h1>You are not authorized to get this page.
      </>
    );
  }
  return <>{children}</>;
};

export default GuardCapacityComponent;
