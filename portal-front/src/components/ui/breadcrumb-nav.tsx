'use client';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Fragment, FunctionComponent } from 'react';

interface BreadcrumbProps {
  value: BreadcrumbNavLink[];
}

export interface BreadcrumbNavLink {
  href?: string;
  label: string;
  original?: boolean;
}

export const BreadcrumbNav: FunctionComponent<BreadcrumbProps> = ({
  value,
}) => {
  const t = useTranslations();
  return (
    <Breadcrumb className="pb-s sm:pb-l">
      <BreadcrumbList>
        {value.map(({ href, label, original }, index) => {
          const lastIndex = value.length - 1 === index;
          return (
            <Fragment key={index}>
              {href ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link
                        className="hover:underline"
                        href={href}>
                        {original ? label : t(label)}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage
                    className={cn(!lastIndex && 'text-muted-foreground')}>
                    {original ? label : t(label)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {!lastIndex && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
