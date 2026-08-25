'use client';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { Control } from 'react-hook-form';
import {
  NO_ROLE_VALUE,
  RoleFormField,
  RolePanelConfig,
  TrialUserRolesFormValues,
} from './manage-trial.const';
import { MixedRoleDefault } from './manage-trial.utils';

interface TrialUserRolePanelFieldsProps {
  control: Control<TrialUserRolesFormValues>;
  bundleRolePanels: RolePanelConfig[];
  mixedRoleDefaults?: Partial<Record<PlatformIdentifier, MixedRoleDefault>>;
}

export const TrialUserRolePanelFields = ({
  control,
  bundleRolePanels,
  mixedRoleDefaults,
}: TrialUserRolePanelFieldsProps) => {
  const t = useTranslations();
  return (
    <div className="flex flex-col md:flex-row gap-l mt-l">
      {bundleRolePanels.map(({ platform, roles, defaultRole }) => {
        const fieldName: RoleFormField = `${platform}Role`;
        const namespace = `Service.Bundle.ManageTrial.Roles.${platform}`;
        const isOptional = platform !== PlatformIdentifier.Xtmone;
        const title = t(`${namespace}.Title`, { count: 1 });
        const isMixed = mixedRoleDefaults?.[platform]?.isMixed ?? false;
        const untouchedRoleDefault =
          mixedRoleDefaults?.[platform]?.role ?? defaultRole;

        return (
          <FormField
            key={platform}
            control={control}
            name={fieldName}
            render={({ field, fieldState }) => {
              const isUntouchedAndMixed = isMixed && !fieldState.isTouched;
              const noAccessFallback = isOptional ? NO_ROLE_VALUE : undefined;
              let value: string | undefined;
              if (fieldState.isTouched) {
                value = field.value ?? noAccessFallback;
              } else if (isUntouchedAndMixed) {
                value = '';
              } else {
                value = untouchedRoleDefault ?? noAccessFallback;
              }
              const isNoAccessSelected = value === NO_ROLE_VALUE;
              return (
                <FormItem className="gap-m md:flex-1">
                  <FormLabel>{title}</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(
                          value === NO_ROLE_VALUE ? undefined : value
                        );
                        field.onBlur(); // mark field as touched (Radix doesn't fire blur on select)
                      }}
                      value={value}>
                      <SelectTrigger
                        className={
                          isNoAccessSelected || isUntouchedAndMixed
                            ? 'bg-input-bg-default'
                            : 'bg-elevation-surface-highlight-layer-2'
                        }>
                        <SelectValue
                          placeholder={isUntouchedAndMixed ? title : undefined}
                        />
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
                  </FormControl>
                  {isUntouchedAndMixed && (
                    <p className="text-content-body-compact text-text-default-secondary">
                      {t(
                        'Service.Bundle.ManageTrial.EditUsersDialog.MixedRoles'
                      )}
                    </p>
                  )}
                </FormItem>
              );
            }}
          />
        );
      })}
    </div>
  );
};
