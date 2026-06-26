'use client';

import { SharedNavigation } from '@/components/menu/SharedNavigation';
import { usePublicNavigation } from './use-public-navigation';

interface PublicNavigationProps {
  open: boolean;
}

const PublicNavigation = ({ open }: PublicNavigationProps) => {
  const { sections, bottomLinks } = usePublicNavigation();

  return (
    <SharedNavigation
      open={open}
      sections={sections}
      bottomLinks={bottomLinks}
    />
  );
};

export default PublicNavigation;
