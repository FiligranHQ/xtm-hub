'use client';

import { SharedNavigation } from '@/components/menu/SharedNavigation';
import { usePrivateNavigation } from '@/components/menu/use-private-navigation';

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
