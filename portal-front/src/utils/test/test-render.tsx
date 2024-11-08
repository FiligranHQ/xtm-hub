import { PortalContext } from '@/components/portal-context';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { FunctionComponent, ReactNode } from 'react';
import { RelayEnvironmentProvider } from 'react-relay/hooks';
import { EnvironmentConfig } from 'relay-runtime';
import { createMockEnvironment } from 'relay-test-utils';
import { meContext_fragment$data } from '../../../__generated__/meContext_fragment.graphql';

export interface ProvidersWrapperProps {
  children: ReactNode;
  me?: meContext_fragment$data;
  relayConfig?: Partial<EnvironmentConfig>;
}

export const generateMockUser = (
  me?: Partial<meContext_fragment$data> | null
) => {
  return {
    id: 'mock_id',
    email: 'admin@filigran.io',
    capabilities: [
      {
        name: 'ADMIN',
      },
      {
        name: 'BYPASS',
      },
    ],
    roles_portal_id: [
      {
        id: 'role_id',
      },
    ],
    ' $fragmentType': 'context_fragment',
    ...me,
  } as meContext_fragment$data;
};
export const ProvidersWrapper = ({
  children,
  relayConfig,
  me,
}: ProvidersWrapperProps) => {
  const relayEnv = createMockEnvironment(relayConfig);
  return (
    <RelayEnvironmentProvider environment={relayEnv}>
      <PortalContext me={me}>{children}</PortalContext>
    </RelayEnvironmentProvider>
  );
};

interface TestRenderOptions {
  relayConfig?: Partial<EnvironmentConfig>;
  me?: Partial<meContext_fragment$data> | null;
}

/**
 * Renders a React component to test it.
 *
 * @param ui The React component to test.
 * @param options (optional) Options to configure mocked providers needed to render the component.
 * @returns Rendered component we can manipulate and make assertions on.
 */
const testRender = (ui: ReactNode, options?: TestRenderOptions) => {
  return {
    user: userEvent.setup(),
    ...render(ui, {
      wrapper: ({ children }) => (
        <TestWrapper options={options}>{children}</TestWrapper>
      ),
    }),
  };
};

interface TestWrapperProps {
  options?: TestRenderOptions;
  children: ReactNode;
}

export const TestWrapper: FunctionComponent<TestWrapperProps> = ({
  options,
  children,
}) => {
  const { relayConfig, me } = options ?? {};
  return (
    <ProvidersWrapper
      relayConfig={relayConfig}
      me={generateMockUser(me)}>
      <NextIntlClientProvider locale={'fr'}>{children}</NextIntlClientProvider>
    </ProvidersWrapper>
  );
};

export default testRender;
