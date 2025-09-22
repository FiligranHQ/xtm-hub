import * as React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main>
        <section className="pt-l">{children}</section>
      </main>
    </div>
  );
}
