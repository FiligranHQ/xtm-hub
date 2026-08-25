'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { ServiceGroupName } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { NO_ROLE_VALUE } from './manage-trial.const';

interface RoleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  roles: ServiceGroupName[];
  namespace: string;
  isOptional: boolean;
  placeholder?: string;
  disabled?: boolean;
  triggerClassName: string;
}

export const RoleSelect = ({
  value,
  onValueChange,
  roles,
  namespace,
  isOptional,
  placeholder,
  disabled,
  triggerClassName,
}: RoleSelectProps) => {
  const t = useTranslations();
  return (
    <Select
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-elevation-surface-highlight-layer-2">
        {isOptional && (
          <SelectItem
            value={NO_ROLE_VALUE}
            className="bg-input-bg-default">
            {t('Service.Bundle.ManageTrial.Roles.NoAccess')}
          </SelectItem>
        )}
        {roles.map((role) => (
          <SelectItem
            key={role}
            value={role}>
            {t(`${namespace}.${role}.Label`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
