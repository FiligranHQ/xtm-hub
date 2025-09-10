import * as React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <section className="pt-m">{children}</section>
    </main>
  );
}
