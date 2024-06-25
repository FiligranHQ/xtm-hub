'use client';

import * as React from 'react';
import useGranted from '@/hooks/useGranted';
import {Restriction} from '../../__generated__/meContext_fragment.graphql';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction: Restriction;
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction,
}) => {
  if (useGranted(capacityRestriction) === false) {
    return;
  }
  return <>{children}</>;
};

export default GuardCapacityComponent;
