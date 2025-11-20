import React from 'react';

interface Props {
  actions?: React.ReactNode;
}

export const TrialsHeader: React.FC<Props> = ({ actions }) => {
  return (
    <header className="flex justify-between items-start my-xl">
      <div className="flex flex-col">
        <h2 className="text-blue text-2xl mb-2">Welcome to Filigran</h2>
        <h1 className="text-3xl">
          New to OpenCTI Trial? This is a great place to start!
        </h1>
      </div>
      <div className="flex gap-s">{actions}</div>
    </header>
  );
};
