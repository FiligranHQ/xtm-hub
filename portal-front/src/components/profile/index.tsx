import {
  ProfileFormEdit,
  ProfileFormEditSchema,
} from '@/components/profile/form/edit';
import React from 'react';

export const Profile: React.FC = () => {
  const handleSubmit = (values: ProfileFormEditSchema) => {
    console.warn(values);
  };

  return (
    <>
      <ProfileFormEdit onSubmit={handleSubmit} />
    </>
  );
};
