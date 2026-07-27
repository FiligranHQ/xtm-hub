import { formatPersonNames } from '@/utils/format/name';
import { PublicDocumentData } from '@/utils/shareable-resources/shareable-resources.types';
import { Avatar } from '@filigran/ui/clients';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';

interface UserDisplayProps {
  uploader:
    documentItem_fragment$data['uploader'] | PublicDocumentData['uploader'];
}

export const UserDisplay = ({ uploader }: UserDisplayProps) => {
  const formattedName = formatPersonNames(uploader);
  const fallbackEmail =
    uploader && 'email' in uploader ? (uploader.email ?? '') : '';
  const displayedIdentity = formattedName || fallbackEmail;

  return (
    <>
      <div className="size-8 shrink-0 [&_img]:object-cover">
        <Avatar src={uploader?.picture ?? ''} />
      </div>
      <span className="truncate max-w-[220px]">{displayedIdentity}</span>
    </>
  );
};
