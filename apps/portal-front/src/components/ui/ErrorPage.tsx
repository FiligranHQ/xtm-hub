'use client';
import { FunctionComponent, ReactNode } from 'react';
import { DisplayLogo } from '@/components/ui/DisplayLogo';

interface ErrorPageProps {
  children: ReactNode;
}
export const ErrorPage: FunctionComponent<ErrorPageProps> = ({ children }) => {
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
