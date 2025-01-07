import { Button } from 'filigran-ui';
import * as React from 'react';

interface CreateButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const TriggerButton = React.forwardRef<HTMLButtonElement, CreateButtonProps>(
  ({ label, ...props }, ref) => (
    <Button
      ref={ref}
      aria-label={label}
      {...props}>
      {label}
    </Button>
  )
);

TriggerButton.displayName = 'CreateButton';

export default TriggerButton;
