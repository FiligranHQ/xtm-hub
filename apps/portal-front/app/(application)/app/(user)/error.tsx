'use client';
import AppError from '../../../../src/components/AppError';

export default function Error({
  error,
}: {
  error: Error & { digest?: string; componentStack?: string };
  reset: () => void;
}) {
  return <AppError error={error} />;
}
