import { SearchIcon } from 'filigran-icon';
import { Input, InputProps } from 'filigran-ui/servers';
import { FunctionComponent } from 'react';

export const SearchInput: FunctionComponent<InputProps> = (props) => {
  return (
    <Input
      {...props}
      startIcon={<SearchIcon className="size-4" />}
    />
  );
};
