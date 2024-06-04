'use client';

import * as React from 'react';
import useGranted from '@/hooks/useGranted';
import { useRouter } from 'next/navigation';
import { Restriction } from '../../__generated__/meContext_fragment.graphql';

// Component interface
interface GuardComponentProps {
  children: React.ReactNode;
  capacityRestriction: Restriction;
}

const GuardCapacityComponent: React.FunctionComponent<GuardComponentProps> = ({
  children,
  capacityRestriction,
}) => {
  const router = useRouter();
  if (!useGranted(capacityRestriction)) {
    router.replace('/');
    return null;
  }
  return <>{children}</>;
};

export default GuardCapacityComponent;
