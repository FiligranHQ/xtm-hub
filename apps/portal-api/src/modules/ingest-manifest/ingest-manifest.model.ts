import { Connector } from '../services/integration-feeds/integrations.model';

export interface ManifestInformation extends Partial<Connector> {
  labels: string[];
  logo: string; // URL or path to log
}
