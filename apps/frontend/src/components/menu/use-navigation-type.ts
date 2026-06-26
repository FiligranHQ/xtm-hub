import { ElementType } from 'react';

export interface SectionLink {
  href?: string;
  label: string;
  external?: boolean;
  highlight?: boolean;
  badge?: string;
}

export interface BottomLink {
  key: string;
  href: string;
  icon: ElementType;
  label: string;
  external?: boolean;
}

export interface SectionConfig {
  key: string;
  label: string;
  icon: ElementType;
  pathPrefix: string;
  links: SectionLink[];
  href?: string;
}
