import { ServiceListFilterKey } from '@/components/service/components/header/ServiceListHeader';
import { useServiceListLocalStorageKeyContext } from '@/components/service/components/ServiceListLocalStorageKeyContext';
import { SelectedValuesDisplay } from '@/components/ui/shareable-resource/logical-multi-select/SelectedValuesDisplay';
import { useRegisteredPlatforms } from '@/hooks/use-registered-platforms';
import { useRegisteredProductVersions } from '@/hooks/use-registered-product-versions';
import { useServiceListFilters } from '@/hooks/use-service-list-filters';
import { useServiceListLocalStorage } from '@/hooks/use-service-list-local-storage';
import { CheckIcon, InfoIcon } from '@filigran/icon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  SimpleTooltip,
} from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

interface ProductVersionFilterProps {
  platformIdentifier: PlatformIdentifier;
  /**
   * On public pages there is no authenticated user/organization, so the
   * registered-instance lookup (and its "you already have this version"
   * tooltip) must be skipped entirely.
   */
  publicPath?: boolean;
}

export const ProductVersionFilter = ({
  platformIdentifier,
  publicPath = false,
}: ProductVersionFilterProps) => {
  const t = useTranslations();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const { productVersions: versions } =
    useRegisteredProductVersions(platformIdentifier);

  // Versions the org already has a registered instance for, used to flag
  // matching options with a tooltip below.
  const { platforms } = useRegisteredPlatforms(platformIdentifier, {
    onlyActive: true,
    skip: publicPath,
  });
  const registeredVersions = useMemo(
    () => new Set(platforms.map((platform) => platform.version)),
    [platforms]
  );

  const { localStorageKey } = useServiceListLocalStorageKeyContext();
  const { productVersions, setProductVersions, removeProductVersions } =
    useServiceListLocalStorage(localStorageKey);
  const selectedVersion = Object.keys(productVersions)[0];

  const { removeFilter } = useServiceListFilters();
  const removeProductVersionsFilter = () => {
    removeProductVersions();
    removeFilter(ServiceListFilterKey.ProductVersion);
  };

  // Single-select: picking a version replaces any previous selection;
  // picking the already-selected version clears it.
  const selectVersion = (version: string) => {
    setProductVersions(version === selectedVersion ? {} : { [version]: [] });
    setIsPopoverOpen(false);
  };

  return (
    <Popover
      open={isPopoverOpen}
      onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          className="flex h-auto min-h-9 w-full items-center justify-between bg-inherit p-0 hover:bg-hover">
          <SelectedValuesDisplay
            groupedSelections={
              selectedVersion
                ? [
                    {
                      parentValue: selectedVersion,
                      parentLabel: selectedVersion,
                      children: [],
                    },
                  ]
                : []
            }
            optionLabel={t(
              'Service.OpenctiIntegrations.Filter.ProductVersion.Label'
            )}
            placeholder={t(
              'Service.OpenctiIntegrations.Filter.ProductVersion.Placeholder'
            )}
            onRemove={removeProductVersionsFilter}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 drop-shadow-sm"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>{t('Utils.NotFound')}</CommandEmpty>
            <CommandGroup>
              {versions.map((version) => {
                const isSelected = version === selectedVersion;
                return (
                  <CommandItem
                    key={version}
                    value={version}
                    onSelect={() => selectVersion(version)}
                    className="cursor-pointer">
                    <CheckIcon
                      className={`mr-2 h-4 w-4 ${isSelected ? '' : 'invisible'}`}
                    />
                    <span className="flex-1">{version}</span>
                    {registeredVersions.has(version) && (
                      <SimpleTooltip
                        title={t(
                          'Service.OpenctiIntegrations.Filter.ProductVersion.RegisteredInstanceTooltip'
                        )}>
                        <InfoIcon className="h-4 w-4 text-feedback-info-primary" />
                      </SimpleTooltip>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <div className="flex items-center justify-between">
                {selectedVersion && (
                  <>
                    <CommandItem
                      onSelect={() => setProductVersions({})}
                      className="flex-1 cursor-pointer justify-center">
                      {t('Utils.Clear')}
                    </CommandItem>
                    <Separator
                      orientation="vertical"
                      className="flex h-full min-h-6"
                    />
                  </>
                )}
                <CommandItem
                  onSelect={() => setIsPopoverOpen(false)}
                  className="flex-1 cursor-pointer justify-center">
                  {t('Utils.Close')}
                </CommandItem>
              </div>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
