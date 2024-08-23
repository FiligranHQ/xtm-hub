import { AddIcon } from 'filigran-icon';
import { Button } from 'filigran-ui/servers';
import * as React from 'react';
import { className } from 'postcss-selector-parser';
import { cn } from '@/lib/utils';

interface CreateButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

const CreateButton = React.forwardRef<HTMLButtonElement, CreateButtonProps>(
  ({ label, ...props }, ref) => (
    <Button
      ref={ref}
      aria-label={label}
      {...props}>
      <AddIcon className="mr-2 h-4 w-4" /> {label}
    </Button>
  )
);

CreateButton.displayName = 'CreateButton';

export default CreateButton;
