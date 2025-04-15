import { db } from '../../../../../knexfile';
import { DocumentMutator } from '../../../../model/kanel/public/Document';
import { PortalContext } from '../../../../model/portal-context';
import { Document } from '../document.helper';
export const insertCsvFeed = async (
  context: PortalContext,
  trx,
  data: DocumentMutator
): Promise<Document[]> => {
  return db<Document>(context, 'Document')
    .insert(data)
    .returning('*')
    .transacting(trx);
};
