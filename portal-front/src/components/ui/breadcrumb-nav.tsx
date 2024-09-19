'use client';
import * as React from 'react';
import { Fragment, FunctionComponent, ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'filigran-ui/servers';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  value: BreadcrumbNavLink[];
}

interface BreadcrumbNavLink {
  href?: string;
  label: ReactNode;
}

export const BreadcrumbNav: FunctionComponent<BreadcrumbProps> = ({
  value,
}) => {
  return (
    <Breadcrumb className="pb-l">
      <BreadcrumbList>
        {value.map(({ href, label }, index) => {
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
                        {label}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem>
                  <BreadcrumbPage
                    className={cn(!lastIndex && 'text-muted-foreground')}>
                    {label}
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
