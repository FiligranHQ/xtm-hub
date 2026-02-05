import React from 'react';

interface Props {
  actions?: React.ReactNode;
  platformName?: string;
}

export const TrialsHeader: React.FC<Props> = ({
  actions,
  platformName = 'OpenCTI',
}) => {
  return (
    <header className="flex justify-between items-start my-xl">
      <div className="flex flex-col">
        <h2 className="text-blue text-2xl mb-2">Welcome to Filigran</h2>
        <h1 className="text-3xl">
          Let’s get you started with your {platformName} free trial!
        </h1>
      </div>
      <div className="flex gap-s">{actions}</div>
    </header>
  );
};
