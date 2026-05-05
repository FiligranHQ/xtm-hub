import { SearchIcon } from '@filigran/icon';
import { Input, InputProps } from '@filigran/ui/servers';

export const SearchInput = (props: InputProps) => {
  return (
    <Input
      {...props}
      startIcon={<SearchIcon className="size-4" />}
    />
  );
};
