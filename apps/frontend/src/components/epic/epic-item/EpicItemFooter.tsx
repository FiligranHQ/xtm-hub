import { EditionTypeMapping } from '@/components/epic/epic-item/EditionTypeMapping';
import { FiligranProductMapping } from '@/components/epic/epic-item/FiligranProductMapping';
import { sortFiligranProducts } from '@/components/epic/filigran-products';
import { Chip } from '@filigran/design-system';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { EditionType, EpicType } from '@graphql/generated';
import { ReactNode } from 'react';

interface EpicItemFooterProps {
  epic: epic_fragment$data;
  children?: ReactNode;
}
export const EpicItemFooter = ({ epic, children }: EpicItemFooterProps) => {
  return (
    <>
      <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {sortFiligranProducts(epic.products).map((product) => (
            <div
              key={product}
              className="flex h-9 items-center gap-1 whitespace-nowrap">
              <p className="bold">{FiligranProductMapping[product].logo}</p>

              <p className="bold">{FiligranProductMapping[product].name}</p>
            </div>
          ))}
          {epic.edition_type !== EditionType.CommunityEdition && (
            <Chip
              label={EditionTypeMapping[epic.edition_type].label}
              severity="ee"
            />
          )}
        </div>
        <div className="flex flex-1 items-center gap-2">
          {epic.epic_type === EpicType.Integration && (
            <div className="flex h-9 shrink-0 items-center">
              <div className="bold h-8 flex items-center capitalize txt-sub-content rounded bg-[var(--bg-elevation-default-layer-0)] text-default-primary p-2">
                {epic.epic_type.toLowerCase()}
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </>
  );
};
