import {
  LogoFiligranIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
} from '@filigran/icon';
import { FiligranProductEnum } from '@generated/models/FiligranProduct.enum';
import { ReactNode } from 'react';

export interface FiligranProductMetadata {
  name: string;
  logo: ReactNode;
  link: string;
}

export const FiligranProductMapping: Record<
  FiligranProductEnum,
  FiligranProductMetadata
> = {
  [FiligranProductEnum.OPENCTI]: {
    name: 'OpenCTI',
    logo: <OpenCtiIconIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/CHZC2D38C',
  },
  [FiligranProductEnum.OPENAEV]: {
    name: 'OpenAEV',
    logo: <OpenAevIconIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/CJ1PHBHF1',
  },
  [FiligranProductEnum.XTMHUB]: {
    name: 'XTM Hub',
    logo: <LogoFiligranIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/C08HU35NPD4',
  },
  [FiligranProductEnum.XTMONE]: {
    name: 'XTM One',
    logo: <LogoXtmOneIcon className="w-5 h-5" />,
    link: 'https://filigran-community.slack.com/archives/CHNEM9NUT',
  },
};
