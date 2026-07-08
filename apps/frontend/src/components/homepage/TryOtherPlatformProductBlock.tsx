'use client';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { Button, Card, CardContent } from '@filigran/ui';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

type TryOtherPlatformProductBlockProps = {
  product: PlatformIdentifierEnum.OPENCTI | PlatformIdentifierEnum.OPENAEV;
};

const TryOtherPlatformProductBlock = ({
  product,
}: TryOtherPlatformProductBlockProps) => {
  const t = useTranslations('HomePage.TryOtherPlatform');

  const { learnMorePrivateUrl, name, Icon } = PlatformMetadataMapping[product];

  return (
    <Card className="bg-elevation-background-layer-3 pt-l mt-xxl border-none rounded-xl">
      <CardContent className="p-l flex flex-col gap-xl md:justify-between">
        <h2 className="font-semibold">{t('Title')}</h2>
        <Button
          asChild
          variant="outline"
          className="font-semibold w-full border-elevation-border-strong-layer-3">
          <Link
            href={learnMorePrivateUrl}
            className="inline-flex items-center gap-xs text-primary">
            <Icon className="size-4" />
            {t(`Cta`, { productName: name })}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TryOtherPlatformProductBlock;
