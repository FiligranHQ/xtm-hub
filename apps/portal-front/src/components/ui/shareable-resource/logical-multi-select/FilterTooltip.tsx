import { Fragment, FunctionComponent } from 'react';
import {
  FilterLabel,
  GroupedSelection,
  OrSeparator,
  SelectionChip,
} from '@/components/ui/shareable-resource/logical-multi-select/SelectedValuesDisplay';

export const FilterTooltip: FunctionComponent<{
  groupedSelections: GroupedSelection[];
  optionLabel: string;
}> = ({ groupedSelections, optionLabel }) => {
  return (
    <SelectionChip className="space-y-xs space-x-xs px-s py-xs text-xs leading-6">
      <FilterLabel className="font-semibold">{optionLabel} =</FilterLabel>
      {groupedSelections.map((group, index) => (
        <Fragment key={group.parentValue}>
          {index > 0 && <OrSeparator className="h-6 leading-6 px-xs rounded" />}
          {group.children.length > 0 ? (
            <>
              {group.children.map((child, index) => (
                <Fragment key={child.value}>
                  {index > 0 && (
                    <OrSeparator className="h-6 leading-6 px-xs rounded" />
                  )}
                  <FilterLabel>{child.label}</FilterLabel>
                </Fragment>
              ))}
            </>
          ) : (
            <FilterLabel>{group.parentLabel}</FilterLabel>
          )}
        </Fragment>
      ))}
    </SelectionChip>
  );
};
