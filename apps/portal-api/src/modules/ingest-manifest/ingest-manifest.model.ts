import { Connector } from '../services/integrations/integrations.model';

export interface ManifestInformation extends Partial<Connector> {
  use_cases: string[];
  logo: string; // URL or path to log
}
