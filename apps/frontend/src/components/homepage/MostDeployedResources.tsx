import HomepageResourceCard from '@/components/homepage/HomepageResourceCard';
import { BadgeOverflow } from '@/components/ui/BadgeOverflowCounter';
import { getTranslations } from 'next-intl/server';

interface HardcodedResource {
  name: string;
  shortDescription: string;
  url: string;
  active: boolean;
  verified?: boolean;
  deployable?: boolean;
  useCases: BadgeOverflow[];
  footerTags: string[];
}

const HARDCODED_RESOURCES: HardcodedResource[] = [
  {
    name: 'Threat Intelligence Overview',
    shortDescription:
      'A comprehensive overview of your threat intelligence landscape with key metrics and indicators.',
    url: '/en/cybersecurity-solutions/opencti-integrations/abuseipdb',
    active: true,
    verified: true,
    deployable: true,
    useCases: [
      { id: '1', name: 'Threat Analysis' },
      { id: '2', name: 'Reporting' },
      { id: '3', name: 'Monitoring' },
    ],
    footerTags: ['OpenCTI', 'Playbooks'],
  },
  {
    name: 'Malware Analysis Dashboard',
    shortDescription:
      'Deep dive into malware families, techniques and associated threat actors.',
    url: '/en/cybersecurity-solutions/opencti-integrations/abuseipdb-ipblacklist',
    active: false,
    useCases: [
      { id: '4', name: 'Malware Analysis' },
      { id: '5', name: 'Threat Hunting' },
    ],
    footerTags: ['OpenCTI'],
  },
  {
    name: 'Vulnerability Tracking',
    shortDescription:
      'Monitor CVEs and vulnerabilities affecting your organization in real time.',
    url: '/en/cybersecurity-solutions/opencti-integrations/abuse-ssl',
    active: true,
    useCases: [
      { id: '6', name: 'Vulnerability Management' },
      { id: '7', name: 'Risk Assessment' },
      { id: '8', name: 'Compliance' },
    ],
    footerTags: ['OpenCTI', 'Scenarios'],
  },
  {
    name: 'Threat Actor Monitoring',
    shortDescription:
      'Track threat actors, their campaigns, and associated indicators of compromise.',
    url: '/en/cybersecurity-solutions/opencti-integrations/anyrun-task',
    active: false,
    useCases: [
      { id: '9', name: 'Threat Intelligence' },
      { id: '10', name: 'Attribution' },
    ],
    footerTags: ['OpenCTI', 'Playbooks'],
  },
];

const MostDeployedResources = async () => {
  const t = await getTranslations('PublicHomePage.XtmMostDeployedResources');

  return (
    <section className="flex flex-col gap-l mt-xl">
      <h2 className="text-xl leading-tight">{t('Title')}</h2>
      <ul className="grid grid-cols-4 gap-l">
        {HARDCODED_RESOURCES.map((resource) => (
          <HomepageResourceCard
            key={resource.name}
            {...resource}
          />
        ))}
      </ul>
    </section>
  );
};

export default MostDeployedResources;
