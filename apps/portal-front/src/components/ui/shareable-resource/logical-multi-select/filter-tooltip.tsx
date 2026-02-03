import {
  FilterLabel,
  GroupedSelection,
  OrSeparator,
  SelectionChip,
} from '@/components/ui/shareable-resource/logical-multi-select/selected-values-display';
import { Fragment, FunctionComponent } from 'react';

export const FilterTooltip: FunctionComponent<{
  groupedSelections: GroupedSelection[];
  optionLabel: string;
}> = ({ groupedSelections, optionLabel }) => {
  return (
    <div className="flex items-center gap-xs bg-gray-700 rounded max-w-[400px] p-s">
      <SelectionChip className="flex-wrap gap-xs">
        <FilterLabel className=" font-semibold text-xs">
          {optionLabel} =
        </FilterLabel>
        {groupedSelections.map((group, index) => (
          <Fragment key={group.parentValue}>
            {index > 0 && <OrSeparator className="p-xs" />}
            {group.children.length > 0 ? (
              <>
                {group.children.map((child, index) => (
                  <Fragment key={child.value}>
                    {index > 0 && <OrSeparator className="p-xs" />}
                    <FilterLabel className="text-xs">{child.label}</FilterLabel>
                  </Fragment>
                ))}
              </>
            ) : (
              <FilterLabel className="text-xs">{group.parentLabel}</FilterLabel>
            )}
          </Fragment>
        ))}
      </SelectionChip>
    </div>
  );
};
