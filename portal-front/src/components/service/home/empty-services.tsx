import { Button } from 'filigran-ui/servers';
import Link from 'next/link';
import * as React from 'react';

export const EmptyServices = () => {
  return (
    <section className="center flex flex-col items-center gap-s pt-[20vh]">
      <h2 className="txt-title"> Welcome to your portal!</h2>
      <p> You don&apos;t have any services yet. Check our services!</p>
      <div className={'flex gap-s pt-m'}>
        <Button asChild>
          <Link href={'/service'}>Services</Link>
        </Button>
      </div>
    </section>
  );
};
