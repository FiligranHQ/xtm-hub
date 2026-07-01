'use client';

import { SharedNavigation } from '@/components/menu/SharedNavigation';
import { usePublicNavigation } from './use-public-navigation';

interface PublicNavigationProps {
  open: boolean;
}

const PublicNavigation = ({ open }: PublicNavigationProps) => {
  const { sections, bottomLinks, footerSections } = usePublicNavigation();

  return (
    <SharedNavigation
      open={open}
      sections={sections}
      bottomLinks={bottomLinks}
      footerSections={footerSections}
    />
  );
};

export default PublicNavigation;
