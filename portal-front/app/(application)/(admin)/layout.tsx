'use client';
import * as React from 'react';
import useGranted from '@/hooks/useGranted';
import { useRouter } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

// Component
const Layout: React.FunctionComponent<LayoutProps> = async ({ children }) => {
  const router = useRouter();
  if (!useGranted('ADMIN')) {
    router.push('/');
  }
  return <>{children}</>;
};

// Component export
export default Layout;
