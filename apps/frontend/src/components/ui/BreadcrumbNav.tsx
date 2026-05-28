'use client';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@filigran/ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Fragment } from 'react';

interface BreadcrumbProps {
  value: BreadcrumbNavLink[];
}

export interface BreadcrumbNavLink {
  href?: string;
  label: string;
  original?: boolean;
  fallback?: string;
}

export const BreadcrumbNav = ({ value }: BreadcrumbProps) => {
  const t = useTranslations();
  const renderLabel = ({ label, original, fallback }: BreadcrumbNavLink) => {
    if (original) {
      return label;
    }
    if (fallback !== undefined && !t.has(label)) {
      return fallback;
    }
    return t(label);
  };
  return (
    <Breadcrumb className="pb-s sm:pb-l">
      <BreadcrumbList className="pl-0">
        {value.map((link, index) => {
          const { href } = link;
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
                        {renderLabel(link)}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage
                    className={cn(!lastIndex && 'text-muted-foreground')}>
                    {renderLabel(link)}
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
