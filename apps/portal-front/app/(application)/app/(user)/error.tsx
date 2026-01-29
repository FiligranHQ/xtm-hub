'use client';
import AppError from '@/components/app-error';

export default function Error({
  error,
}: {
  error: Error & { digest?: string; componentStack?: string };
  reset: () => void;
}) {
  return <AppError error={error} />;
}
