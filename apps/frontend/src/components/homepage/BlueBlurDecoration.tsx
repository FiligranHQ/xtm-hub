import { cn } from '@/lib/utils';

const BlueBlurDecoration = () => {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={cn(
          'absolute left-20 top-35 size-69.75 bg-filigran-brand-primary-transparency blur-[200px]'
        )}
      />
      <div
        className={cn(
          'absolute right-0 top-35 translate-x-1/2 size-110.75 bg-filigran-brand-primary-transparency blur-[200px]'
        )}
      />
    </div>
  );
};

export default BlueBlurDecoration;
