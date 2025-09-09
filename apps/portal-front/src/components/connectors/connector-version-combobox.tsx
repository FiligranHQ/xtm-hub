'use client';

import { Combobox } from 'filigran-ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  dataTab: { value: string; label: string }[];
}

export function ConnectorVersionCombobox({ dataTab }: Props) {
  const router = useRouter();

  const [selectedValue, setSelectedValue] = useState({
    value: 'master',
    label: 'Latest',
  });
  return (
    <Combobox
      className="w-1/3"
      dataTab={dataTab}
      order="Search an OpenCTI version"
      placeholder="Search a version..."
      emptyCommand="No version found"
      value={selectedValue}
      onValueChange={(item) => {
        if (item) {
          setSelectedValue(item);
          router.push(
            `/cybersecurity-solutions/opencti-connectors/${item.value}`
          );
        }
      }}
    />
  );
}
