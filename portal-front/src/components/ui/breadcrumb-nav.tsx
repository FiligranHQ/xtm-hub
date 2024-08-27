import * as React from 'react';
import { FunctionComponent, ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from 'filigran-ui/servers';
import Link from 'next/link';

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
    <Breadcrumb className="pb-2">
      <BreadcrumbList>
        {value.map(({ href, label }, index) => {
          const lastIndex = value.length - 1 === index;
          return (
            <>
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
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {!lastIndex && <BreadcrumbSeparator />}
            </>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
