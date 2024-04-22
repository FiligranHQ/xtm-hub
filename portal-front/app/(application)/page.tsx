import * as React from 'react';

export const dynamic = 'force-dynamic';

// Component interface
interface PageProps {}

// Component
const Page: React.FunctionComponent<PageProps> = () => {
  return (
    <>
      <div>
        <b>Welcome to the platform</b>
      </div>
    </>
  );
};

// Component export
export default Page;
