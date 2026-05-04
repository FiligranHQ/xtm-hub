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
}

export const FiligranProductMapping: Record<
  FiligranProductEnum,
  FiligranProductMetadata
> = {
  [FiligranProductEnum.OPENCTI]: {
    name: 'OpenCTI',
    logo: <OpenCtiIconIcon className="w-5 h-5" />,
  },
  [FiligranProductEnum.OPENAEV]: {
    name: 'OpenAEV',
    logo: <OpenAevIconIcon className="w-5 h-5" />,
  },
  [FiligranProductEnum.XTMHUB]: {
    name: 'XTM Hub',
    logo: <LogoFiligranIcon className="w-5 h-5" />,
  },
  [FiligranProductEnum.XTMONE]: {
    name: 'XTM One',
    logo: <LogoXtmOneIcon className="w-5 h-5" />,
  },
};
