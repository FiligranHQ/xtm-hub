import {
  LogoFiligranIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
} from '@filigran/icon';
import { FiligranProduct } from '@graphql/generated';
import { ReactNode } from 'react';

export interface FiligranProductMetadata {
  name: string;
  logo: ReactNode;
  link: string;
}

export const FiligranProductMapping: Record<
  FiligranProduct,
  FiligranProductMetadata
> = {
  [FiligranProduct.Opencti]: {
    name: 'OpenCTI',
    logo: <OpenCtiIconIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/CHZC2D38C',
  },
  [FiligranProduct.Openaev]: {
    name: 'OpenAEV',
    logo: <OpenAevIconIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/CJ1PHBHF1',
  },
  [FiligranProduct.Xtmhub]: {
    name: 'XTM Hub',
    logo: <LogoFiligranIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/C08HU35NPD4',
  },
  [FiligranProduct.Xtmone]: {
    name: 'XTM One',
    logo: <LogoXtmOneIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/CHNEM9NUT',
  },
};
