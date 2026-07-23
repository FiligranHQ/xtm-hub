'use client';
import { ReactNode } from 'react';

interface SharedContentProps {
  children: ReactNode;
  className?: string;
  mainClassName?: string;
}

export const SharedContent = ({
  children,
  className,
  mainClassName = 'h-full w-full overflow-y-auto',
}: SharedContentProps) => (
  <div className="flex-1 min-h-0">
    <main className={mainClassName}>
      <div className={className}>{children}</div>
    </main>
  </div>
);
