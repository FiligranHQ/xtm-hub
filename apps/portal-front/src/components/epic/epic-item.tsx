'use client';
import { epic_fragment$data } from '@generated/epic_fragment.graphql';

interface EpicListProps {
  epic: epic_fragment$data;
}

export const EpicItem = ({ epic }: EpicListProps) => {
  return <>{epic.short_description}</>;
};
