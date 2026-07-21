import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ShareableResourceCardVersion } from './ShareableResourceCardVersion';

const compatibilityHookMock = vi.fn();

vi.mock('@/hooks/use-registered-platforms', () => ({
  useRegisteredPlatforms: () => ({
    platforms: [{ title: 'OpenCTI', version: '6.7' }],
  }),
}));

vi.mock('@/hooks/use-build-compatibility-translation-key', () => ({
  useBuildCompatibilityTranslationKey: (...args: unknown[]) =>
    compatibilityHookMock(...args),
}));

vi.mock('@filigran/icon', () => ({
  CheckIndeterminateIcon: () => <svg data-testid="incompatible-icon" />,
}));

vi.mock('@filigran/ui/clients', () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  Tooltip: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <div role="tooltip">{children}</div>
  ),
}));

describe('ShareableResourceCardVersion', () => {
  it('renders incompatibility tooltip when some platforms are incompatible', () => {
    compatibilityHookMock.mockReturnValue({
      platformToBeUpdated: 'OpenCTI',
      incompatiblePlatformsCount: 2,
    });

    testRender(
      <ShareableResourceCardVersion
        product_version="6.8"
        requiredProductVersion="6.8"
        className="version-class"
      />
    );

    expect(screen.getByText('6.8')).toBeInTheDocument();
    expect(screen.getByTestId('incompatible-icon')).toBeInTheDocument();
    expect(
      screen.getByText('Service.Connectors.Incompatible')
    ).toBeInTheDocument();
  });

  it('renders plain version when there is no incompatibility', () => {
    compatibilityHookMock.mockReturnValue({
      platformToBeUpdated: '',
      incompatiblePlatformsCount: 0,
    });

    testRender(
      <ShareableResourceCardVersion
        product_version="6.8"
        requiredProductVersion="6.8"
        className="version-class"
      />
    );

    expect(screen.getByText('6.8')).toHaveClass('version-class');
    expect(screen.queryByTestId('incompatible-icon')).not.toBeInTheDocument();
  });
});
