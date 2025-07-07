import { FunctionComponent, ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout: FunctionComponent<ContentLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex flex-1 h-full">
      <main className={`flex-1 overflow-auto bg-background p-6 h-full"`}>
        {children}
      </main>
    </div>
  );
};
