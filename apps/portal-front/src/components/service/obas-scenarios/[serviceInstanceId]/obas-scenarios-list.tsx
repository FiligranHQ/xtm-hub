import { getLabels } from '@/components/admin/label/label.utils';
import {
  obasScenariosFragment,
  obasScenariosItem,
  ObasScenariosListQuery,
} from '@/components/service/obas-scenarios/obas-scenario.graphql';

import { SearchInput } from '@/components/ui/search-input';
import { debounceHandleInput } from '@/utils/debounce';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import {
  obasScenariosItem_fragment$data,
  obasScenariosItem_fragment$key,
} from '@generated/obasScenariosItem_fragment.graphql';
import { MultiSelectFormField } from 'filigran-ui';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import ObasScenarioCard from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenario-card';
import ObasScenarioButtons from '@/components/service/obas-scenarios/[serviceInstanceId]/obas-scenarios-list-buttons';
import { SettingsContext } from '@/components/settings/env-portal-context';
import useServiceCapability from '@/hooks/useServiceCapability';
import { obasScenariosList$key } from '@generated/obasScenariosList.graphql';
import { obasScenariosQuery } from '@generated/obasScenariosQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface ObasScenariosListProps {
  queryRef: PreloadedQuery<obasScenariosQuery>;
  serviceInstance: serviceInstance_fragment$data;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const ObasScenariosList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: ObasScenariosListProps) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);

  const queryData = usePreloadedQuery<obasScenariosQuery>(
    ObasScenariosListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    obasScenariosQuery,
    obasScenariosList$key
  >(obasScenariosFragment, queryData);
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const [active, draft] = useMemo(() => {
    return data?.obasScenarios.edges.reduce<
      [obasScenariosItem_fragment$data[], obasScenariosItem_fragment$data[]]
    >(
      (acc, { node }) => {
        const obasScenario = readInlineData<obasScenariosItem_fragment$key>(
          obasScenariosItem,
          node
        );

        if (obasScenario.active) {
          acc[0].push(obasScenario);
        } else {
          acc[1].push(obasScenario);
        }
        return acc;
      },
      [[], []]
    );
  }, [data]);

  const firstObasScenario = draft.length > 0 ? draft[0] : active[0];

  const labelOptions = getLabels().map(({ name, id }) => ({
    label: name.toUpperCase(),
    value: id,
  }));
  return (
    <div className="flex flex-col gap-xl">
      <h1>{serviceInstance.name}</h1>
      <div className="flex justify-between gap-s flex-wrap">
        <div className="flex gap-s flex-wrap">
          <SearchInput
            containerClass="w-[20rem] flex-1 max-w-[50%]"
            placeholder={t('GenericActions.Search')}
            defaultValue={search}
            onChange={debounceHandleInput(onSearchChange)}
          />
          <div className="w-[20rem] flex-1 max-w-[50%]">
            <MultiSelectFormField
              options={labelOptions}
              defaultValue={labels}
              placeholder={t('GenericActions.FilterLabels')}
              noResultString={t('Utils.NotFound')}
              onValueChange={onLabelFilterChange}
              variant="inverted"
            />
          </div>
        </div>
        <div className="flex gap-s">
          <ObasScenarioButtons
            serviceInstance={serviceInstance}
            firstObasScenarioSubscriptionId={
              firstObasScenario?.subscription?.id ?? ''
            }
            connectionId={data.obasScenarios!.__id}
          />
        </div>
      </div>
      {userCanUpdate && draft.length > 0 && (
        <>
          <div className="txt-category">
            {t('Service.ObasScenario.NonActive')}:
          </div>
          <ul
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
            }>
            {draft.map((obasScenario) => (
              <ObasScenarioCard
                connectionId={data.obasScenarios!.__id}
                key={obasScenario.id}
                obasScenario={obasScenario}
                serviceInstance={serviceInstance}
                detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}/${obasScenario.id}`}
                shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${obasScenario.slug}`}
              />
            ))}
          </ul>
          {active.length > 0 && (
            <div className="txt-category">
              {t('Service.ObasScenario.Active')}:
            </div>
          )}
        </>
      )}
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {active.map((obasScenario) => (
          <ObasScenarioCard
            key={obasScenario.id}
            obasScenario={obasScenario}
            connectionId={data.obasScenarios!.__id}
            serviceInstance={serviceInstance}
            detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}/${obasScenario.id}`}
            shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${obasScenario.slug}`}
          />
        ))}
      </ul>
    </div>
  );
};

export default ObasScenariosList;
