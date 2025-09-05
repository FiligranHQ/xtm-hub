import { getConnectorVersion } from '@/utils/connectors/connectors.fetch';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from 'filigran-ui/clients';
import Link from 'next/link';

export const SelectConnectorVersion = async () => {
  const connectorVersion = await getConnectorVersion();
  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Version" />
      </SelectTrigger>
      <SelectContent>
        {connectorVersion.map(({ version }) => (
          <div key={version}>
            <Link href={`/connectors/${version}`}>{version}</Link>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};
