import MDEditor from '@uiw/react-md-editor';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import * as React from 'react';

// Component interface
interface ShareableResourceDescriptionProps {
  shortDescription: string;
  longDescription: string;
}

// Component
const ShareableResourceDescription: React.FunctionComponent<
  ShareableResourceDescriptionProps
> = ({ shortDescription, longDescription }) => {
  const t = useTranslations();

  const { theme } = useTheme();

  return (
    <div className="flex-[3_3_0%]">
      <h2 className="py-s txt-container-title truncate text-muted-foreground">
        {t('Service.ShareableResources.Details.Overview')}
      </h2>
      <section
        data-color-mode={theme}
        className="border rounded border-border-light bg-page-background">
        <h3 className="p-l">{shortDescription}</h3>
        <MDEditor.Markdown
          className="p-l !bg-page-background"
          source={longDescription}
        />
      </section>
    </div>
  );
};

// Component export
export default ShareableResourceDescription;
