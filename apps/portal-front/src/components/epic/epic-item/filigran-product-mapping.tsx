import {
  LogoFiligranIcon,
  LogoXtmOneIcon,
  OpenAevIconIcon,
  OpenCtiIconIcon,
  OpenGrcIcon,
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
    logo: <OpenCtiIconIcon className="w-6 h-6" />,
  },
  [FiligranProductEnum.OPENAEV]: {
    name: 'OpenAEV',
    logo: <OpenAevIconIcon className="w-6 h-6" />,
  },
  [FiligranProductEnum.OPENGRC]: {
    name: 'OpenGRC',
    logo: <OpenGrcIcon className="w-6 h-6" />,
  },
  [FiligranProductEnum.XTMHUB]: {
    name: 'XTM Hub',
    logo: <LogoFiligranIcon className="w-6 h-6" />,
  },
  [FiligranProductEnum.XTMONE]: {
    name: 'XTM One',
    logo: <LogoXtmOneIcon className="w-6 h-6" />,
  },
};
