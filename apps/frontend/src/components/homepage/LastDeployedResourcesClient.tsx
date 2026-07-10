'use client';

import { resolveHomepageProductLabel } from '@/components/homepage/Homepage.utils';
import LastDeployedResourceRow from '@/components/homepage/LastDeployedResourceRow';
import { LastDeployedOverview } from '@/components/homepage/LastDeployedResourcesSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { Separator } from '@filigran/ui/clients';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Fragment, useState } from 'react';

type LastDeployedResourcesClientProps = {
  products: PlatformIdentifier[];
  overviewByProduct: Partial<Record<PlatformIdentifier, LastDeployedOverview>>;
};

const LastDeployedResourcesClient = ({
  products,
  overviewByProduct,
}: LastDeployedResourcesClientProps) => {
  const t = useTranslations('HomePage.LastDeployedResources');
  const tPlatform = useTranslations('PublicHomePage.XtmPlatform');

  const productsWithResources = products.filter(
    (product) => (overviewByProduct[product]?.resources.length ?? 0) > 0
  );

  const [selectedProduct, setSelectedProduct] = useState<PlatformIdentifier>(
    productsWithResources[0] as PlatformIdentifier
  );

  if (productsWithResources.length === 0) {
    return (
      <section className="flex-1 min-w-0 flex flex-col gap-l">
        <div className="flex items-center justify-center">
          <Image
            src="/xtm_platform.png"
            alt={tPlatform('ImageAlt')}
            width={1370}
            height={680}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-auto max-h-70"
          />
        </div>
      </section>
    );
  }

  const effectiveProduct = (
    productsWithResources.includes(selectedProduct)
      ? selectedProduct
      : productsWithResources[0]
  ) as PlatformIdentifier;

  const resources = overviewByProduct[effectiveProduct]?.resources ?? [];

  return (
    <section className="flex-1 min-w-0 flex flex-col gap-l">
      <div className="flex items-center gap-m">
        <h2 className="content-body-base text-text-default-primary">
          {t('Title')}
        </h2>
        <Select
          value={effectiveProduct}
          onValueChange={(value) =>
            setSelectedProduct(value as PlatformIdentifier)
          }>
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t('ProductPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {productsWithResources.map((product) => (
              <SelectItem
                key={product}
                value={product}>
                {resolveHomepageProductLabel(product)} {t('ProductName')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ul className="flex flex-col gap-l">
        {resources.map((resource, index) => (
          <Fragment key={`${resource.document.id}-${index}`}>
            {index > 0 && (
              <li
                aria-hidden="true"
                className="shrink-0">
                <Separator className="bg-elevation-border-subtle" />
              </li>
            )}
            <li>
              <LastDeployedResourceRow resource={resource} />
            </li>
          </Fragment>
        ))}
      </ul>
    </section>
  );
};

export default LastDeployedResourcesClient;
