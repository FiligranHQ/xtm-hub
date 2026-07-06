'use client';

import { OpenAevIconIcon, OpenCtiIconIcon } from '@filigran/icon';
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

  const href =
    product === PlatformIdentifierEnum.OPENAEV
      ? '/app/service/openaev-free-trial'
      : '/app/service/opencti-free-trial';

  const productKey =
    product === PlatformIdentifierEnum.OPENAEV ? 'OpenAEV' : 'OpenCTI';

  const ProductIcon =
    product === PlatformIdentifierEnum.OPENAEV
      ? OpenAevIconIcon
      : OpenCtiIconIcon;

  return (
    <Card className="bg-elevation-background-layer-3 pt-l border-none rounded-xl">
      <CardContent className="p-l flex flex-col gap-xl md:justify-between">
        <h2 className="font-semibold">{t('Title')}</h2>
        <Button
          asChild
          variant="outline"
          className="font-semibold w-full border-elevation-border-strong-layer-3">
          <Link
            href={href}
            className="inline-flex items-center gap-xs text-primary">
            <ProductIcon className="size-4" />
            {t(`Cta`, { productName: productKey })}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default TryOtherPlatformProductBlock;
