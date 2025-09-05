import { Contract } from '@/utils/connectors/connector.model';
import { Badge, Button } from 'filigran-ui/servers';
import Link from 'next/link';
import React from 'react';

interface ContractDetailPageProps {
  contract: Contract;
}

const ContractDetailPage: React.FC<ContractDetailPageProps> = ({
  contract,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">{contract.title}</h1>
          {contract.use_cases.map((useCase: string) => (
            <Badge key={useCase}>{useCase}</Badge>
          ))}
          {contract.verified && (
            <svg
              className="w-5 h-5 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      <div className=" py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <p className="text-gray-300 leading-relaxed mb-4">
                {contract.description}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <img
                    src={contract.logo}
                    alt={contract.title}
                    className="w-16 h-16 object-contain"
                  />

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {contract.title}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="space-y-s">
                <p className="text-sm text-gray-400">
                  Integration documentation and code
                </p>
                <Button
                  className="p-0"
                  variant="link"
                  asChild>
                  <Link href={contract.source_code}>SERVICENOW</Link>
                </Button>

                <p className="text-xs text-gray-400">
                  Visit the vendor&#39;s page to learn more and get in touch
                </p>
              </div>

              <Button
                className="p-0"
                variant="link"
                asChild>
                <Link href={contract.subscription_link}>VENDOR CONTACT</Link>
              </Button>

              <div className="space-y-3 pt-4 border-t border-slate-700">
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="text-gray-300">Data Import</div>
                </div>
                <div>
                  <div className="text-gray-500">Version</div>
                  <div className="text-gray-300">
                    {contract.support_version}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContractDetailPage;
