import { DocumentData } from '../../../../document/domain/document.domain';
import { Connector } from '../integration.model';

export interface ManifestInformation
  extends
    Partial<Connector>,
    Pick<DocumentData<Connector, string>, 'solution_categories'> {
  use_cases: string[];
  logo: string;
}
