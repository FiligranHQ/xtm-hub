'use client';
import { EpicItemCard } from '@/components/epic/epic-item/EpicItemCard';
import { EpicItemDetailed } from '@/components/epic/epic-item/EpicItemDetailed';
import { Dialog, DialogContent } from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface EpicItemProps {
  epic: epic_fragment$data;
  serviceInstanceId: string;
  userCanUpdate: boolean;
  userCanDelete: boolean;
}

export const EpicItem = ({
  epic,
  serviceInstanceId,
  userCanUpdate,
  userCanDelete,
}: EpicItemProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isOpen = searchParams.get('epicId') === epic.id;

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('epicId');

        const queryString = params.toString();
        const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(targetUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams]
  );

  return (
    <li className="group overflow-hidden flex flex-col relative rounded hover:cursor-pointer bg-page-background h-[183px]">
      <EpicItemCard
        epic={epic}
        serviceInstanceId={serviceInstanceId}
        userCanDelete={userCanDelete}
        userCanUpdate={userCanUpdate}
      />
      <Dialog
        open={isOpen}
        onOpenChange={handleClose}>
        <DialogContent className="p-0 w-full max-w-5xl h-[80vh] max-h-[90vh] flex flex-col overflow-hidden">
          <EpicItemDetailed
            epic={epic}
            serviceInstanceId={serviceInstanceId}
          />
        </DialogContent>
      </Dialog>
    </li>
  );
};
