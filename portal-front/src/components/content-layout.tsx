import { FunctionComponent, ReactNode } from 'react';

interface ContentLayoutProps {
  children: ReactNode;
}

export const ContentLayout: FunctionComponent<ContentLayoutProps> = ({
  children,
}) => {
  return (
    <div className="flex-1 h-full">
      <main
        className={`flex-1 items-center justify-center overflow-auto bg-background p-6 w-full h-full"`}>
        {children}
      </main>
    </div>
  );
};
