import { Contract } from '@/utils/connectors/connector.model';
import { Badge, Button } from 'filigran-ui/servers';
import Link from 'next/link';
import { FunctionComponent } from 'react';

interface ConnectorContractCardProps {
  contract: Contract;
  version?: string;
}

const ConnectorContractCard: FunctionComponent<ConnectorContractCardProps> = ({
  contract,
  version = 'master',
}) => {
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={contract.logo}
              alt={`${contract.title} logo`}
              className="w-full h-full object-contain"
            />
          </div>
          <h3 className="txt-title font-bold ">
            <a href={`/connectors/master/${contract.slug}`}>{contract.title}</a>
          </h3>
        </div>
        {contract.verified && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {contract.use_cases.map((useCase) => (
          <Badge key={useCase}>{useCase}</Badge>
        ))}
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-6">
        {contract.short_description}
      </p>

      <div className="flex gap-3">
        <Button asChild>
          <Link href={`/connectors/${version}/${contract.slug}`}>Details</Link>
        </Button>
      </div>
    </div>
  );
};

export default ConnectorContractCard;
