'use client';

import { SharedNavigation } from '@/components/menu/navigation/shared/SharedNavigation';
import { usePublicNavigation } from './use-public-navigation';

interface PublicNavigationProps {
  open: boolean;
  isCustomViewsEnabled?: boolean;
}

const PublicNavigation = ({
  open,
  isCustomViewsEnabled = false,
}: PublicNavigationProps) => {
  const { sections, bottomLinks, footerSections } =
    usePublicNavigation(isCustomViewsEnabled);

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
