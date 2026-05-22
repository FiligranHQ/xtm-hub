'use client';
import AppError from '@/components/AppError';

interface ErrorProps {
  error: Error & { digest?: string; componentStack?: string };
  reset: () => void;
}

const Error = ({ error }: ErrorProps) => {
  return <AppError error={error} />;
};

export default Error;
