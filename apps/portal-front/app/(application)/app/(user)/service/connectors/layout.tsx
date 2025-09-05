import { SelectConnectorVersion } from '@/components/connectors/select-version';
import * as React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <SelectConnectorVersion />
      <section>{children}</section>
    </main>
  );
}
