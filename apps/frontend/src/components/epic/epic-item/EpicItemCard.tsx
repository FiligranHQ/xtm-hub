import { EpicAdminMenu } from '@/components/epic/epic-item/EpicAdminMenu';
import { EpicItemFooter } from '@/components/epic/epic-item/EpicItemFooter';
import { Separator } from '@filigran/ui/clients';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { MouseEvent } from 'react';

interface EpicItemCardProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
  setIsOpen: (open: boolean) => void;
  userCanDelete: boolean;
  userCanUpdate: boolean;
}

export const EpicItemCard = ({
  epic,
  serviceInstanceId,
  setIsOpen,
  userCanDelete,
  userCanUpdate,
}: EpicItemCardProps) => {
  // Do not open details if it's a click in admin menu
  const handleOpenDetail = (event: MouseEvent<HTMLDivElement>) => {
    const { currentTarget, target } = event;
    if (!(target instanceof Node) || !currentTarget.contains(target)) {
      return;
    }

    if (
      target instanceof HTMLElement &&
      target.closest(' [data-no-open-detail]')
    ) {
      return;
    }

    setIsOpen(true);
  };

  return (
    <>
      <div
        onClick={handleOpenDetail}
        className="h-full flex flex-col flex-1 bg-page-background text-ellipsis overflow-hidden p-m group-hover:bg-hover h-full w-full">
        <h2 className="text-base font-semibold pr-xxl line-clamp-2">
          {epic.title}
        </h2>
        <div className="mt-auto line-clamp-3">
          <p className="h-full text-muted-foreground text-sm">
            {epic.short_description}
          </p>
        </div>
        <div className="mt-auto">
          <Separator />
          <div className="mt-m flex flex-row ">
            <EpicItemFooter
              epic={epic}
              serviceInstanceId={serviceInstanceId}
            />
            <EpicAdminMenu
              epic={epic}
              userCanDelete={userCanDelete}
              userCanUpdate={userCanUpdate}
            />
          </div>
        </div>
      </div>
    </>
  );
};
