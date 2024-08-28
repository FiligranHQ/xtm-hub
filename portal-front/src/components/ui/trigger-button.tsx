import { AddIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import * as React from 'react';
import { ReactNode } from 'react';

interface CreateButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: ReactNode;
}

const TriggerButton = React.forwardRef<HTMLButtonElement, CreateButtonProps>(
  ({ label, icon, ...props }, ref) => (
    <Button
      ref={ref}
      aria-label={label}
      {...props}>
      {icon ? <>{icon}</> : <AddIcon className="mr-2 h-4 w-4" />} {label}
    </Button>
  )
);

TriggerButton.displayName = 'CreateButton';

export default TriggerButton;
