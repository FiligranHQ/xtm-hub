import ResourceMarkdownRenderer from '@/components/service/document/ResourceMarkdownRenderer';
import { useTranslate } from '@/hooks/use-translate';
import { getResourcePageFiligranWebsiteUtm } from '@/utils/filigran-website-utm';

// Component interface
interface ShareableResourceDescriptionProps {
  shortDescription: string;
  longDescription: string;
  serviceDefinitionIdentifier?: string;
}

// Component
const ShareableResourceDescription = ({
  shortDescription,
  longDescription,
  serviceDefinitionIdentifier,
}: ShareableResourceDescriptionProps) => {
  const t = useTranslate();

  return (
    <div className="flex-[3_3_0%] min-w-0">
      <h2 className="py-2 txt-container-title truncate text-muted-foreground">
        {t('Service.ShareableResources.Details.Overview')}
      </h2>
      <section className="rounded bg-elevation-background-layer-1 overflow-x-auto">
        <h3 className="p-4">{shortDescription}</h3>
        <ResourceMarkdownRenderer
          source={longDescription}
          className="p-4"
          filigranWebsiteUtm={getResourcePageFiligranWebsiteUtm(
            serviceDefinitionIdentifier
          )}
        />
      </section>
    </div>
  );
};

// Component export
export default ShareableResourceDescription;
