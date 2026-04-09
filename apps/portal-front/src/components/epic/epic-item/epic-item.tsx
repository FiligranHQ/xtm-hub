'use client';
import { EpicItemCard } from '@/components/epic/epic-item/epic-item-card';
import { EpicItemDetailed } from '@/components/epic/epic-item/epic-item-detailed';
import { Dialog, DialogContent } from '@filigran/ui';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';
import { useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <li className="group overflow-hidden border-light flex flex-col relative rounded border hover:cursor-pointer bg-page-background h-[183px]">
      <EpicItemCard
        epic={epic}
        serviceInstanceId={serviceInstanceId}
        setIsOpen={setIsOpen}
        userCanDelete={userCanDelete}
        userCanUpdate={userCanUpdate}
      />
      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className="p-0 w-full max-w-5xl">
          <EpicItemDetailed
            epic={epic}
            serviceInstanceId={serviceInstanceId}
          />
        </DialogContent>
      </Dialog>
    </li>
  );
};
