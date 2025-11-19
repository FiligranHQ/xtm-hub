'use client';
import { Button } from 'filigran-ui/servers';
import React from 'react';

export const ContactUsButton: React.FC = () => {
  return (
    <Button
      onClick={() => console.warn('Contact Us')}
      variant="outline-primary">
      Contact us
    </Button>
  );
};
