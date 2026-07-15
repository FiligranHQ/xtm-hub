'use client';

import { usePrivateNavigation } from '@/components/menu/navigation/private/use-private-navigation';
import { SharedNavigation } from '@/components/menu/navigation/shared/SharedNavigation';

interface PrivateNavigationProps {
  open: boolean;
}

const PrivateNavigation = ({ open }: PrivateNavigationProps) => {
  const { sections, bottomLinks, footerSections } = usePrivateNavigation();

  return (
    <SharedNavigation
      open={open}
      sections={sections}
      bottomLinks={bottomLinks}
      footerSections={footerSections}
    />
  );
};

export default PrivateNavigation;
