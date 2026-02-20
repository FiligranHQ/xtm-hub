import { FunctionComponent, ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout: FunctionComponent<ContentLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex-1">
      <main
        className={`flex-1 items-center justify-center bg-background p-6 w-full"`}>
        {children}
      </main>
    </div>
  );
};
