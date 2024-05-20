import { FiligranLoader } from 'filigran-icon';
import * as React from 'react';

const Loader = () => {
  return (
    <div className="absolute inset-0 z-50 m-auto h-20 w-20">
      <FiligranLoader />
    </div>
  );
};

export default Loader;
