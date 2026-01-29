'use client';

import AppError from '@/components/app-error';
import { Button } from '@filigran/ui/servers';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; componentStack?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <AppError error={error} />
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
