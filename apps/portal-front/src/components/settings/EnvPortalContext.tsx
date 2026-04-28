import { settingsContext_fragment$data } from '@generated/settingsContext_fragment.graphql';
import * as React from 'react';
import { createContext, FunctionComponent } from 'react';

export interface Settings {
  settings?: settingsContext_fragment$data | null;
}

export interface SettingsProps extends Settings {
  children: React.ReactNode;
}

export const SettingsContext = createContext<Settings>({});

export const generateSettingsContext = (
  settings?: settingsContext_fragment$data | null
): Settings => {
  return { settings };
};

export const SettingsPortalContext: FunctionComponent<SettingsProps> = ({
  children,
  settings,
}) => {
  return (
    <SettingsContext.Provider value={generateSettingsContext(settings)}>
      {children}
    </SettingsContext.Provider>
  );
};
