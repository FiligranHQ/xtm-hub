import { cn } from '@/lib/utils';

const BlueBlurDecoration = () => {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute left-20 top-10 size-69.75 bg-filigran-brand-primary-transparency blur-[200px]'
        )}
      />{' '}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute right-0 top-0 translate-x-1/2 size-110.75 bg-filigran-brand-primary-transparency blur-[200px]'
        )}
      />
    </>
  );
};

export default BlueBlurDecoration;
