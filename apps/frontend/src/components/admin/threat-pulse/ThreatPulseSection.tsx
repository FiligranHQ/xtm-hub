import { cn } from '@/lib/utils';
import { Paper, Text } from '@filigran/design-system';
import { ReactNode, useId } from 'react';

interface ThreatPulseSectionProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const ThreatPulseSection = ({
  title,
  description,
  action,
  className,
  children,
}: ThreatPulseSectionProps) => {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn('min-w-0', className)}>
      <Paper
        padding={16}
        className="flex h-full min-w-0 flex-col gap-l"
        title={
          <Text
            as="h2"
            id={headingId}
            variant="title-sm"
            className="text-text-default-primary">
            {title}
          </Text>
        }
        action={action}>
        {description && (
          <Text
            variant="content-compact"
            className="text-text-default-secondary">
            {description}
          </Text>
        )}
        {children}
      </Paper>
    </section>
  );
};
