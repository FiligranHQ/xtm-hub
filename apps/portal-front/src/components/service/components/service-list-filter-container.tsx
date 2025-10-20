import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const ServiceListFilterContainer: React.FC<Props> = ({ children }) => {
  return <div className="w-[17rem]">{children}</div>;
};
