'use client';
import { DisplayLogo } from '@/components/ui/DisplayLogo';
import { ReactNode } from 'react';

interface ErrorPageProps {
  children: ReactNode;
}
export const ErrorPage = ({ children }: ErrorPageProps) => {
  return (
    <main className="absolute inset-0 z-0 m-auto flex flex-col justify-center items-center px-l">
      <div className="max-w-[450px] w-full">
        <DisplayLogo />
      </div>
      <div className="bg-page-background border border-border-light rounded w-full p-l mb-l mt-xl max-w-[650px]">
        {children}
      </div>
    </main>
  );
};
