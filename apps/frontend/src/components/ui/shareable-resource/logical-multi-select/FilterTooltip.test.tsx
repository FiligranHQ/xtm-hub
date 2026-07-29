import testRender from '@/utils/test/test-render';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FilterTooltip } from './FilterTooltip';

describe('FilterTooltip', () => {
  it('renders child labels and parent labels depending on group content', () => {
    testRender(
      <FilterTooltip
        optionLabel="Type"
        groupedSelections={[
          {
            parentValue: 'connector',
            parentLabel: 'Connector',
            children: [
              { value: 'external', label: 'External' },
              { value: 'stream', label: 'Stream' },
            ],
          },
          {
            parentValue: 'feed',
            parentLabel: 'Feed',
            children: [],
          },
        ]}
      />
    );

    expect(screen.getByText('Type =')).toBeInTheDocument();
    expect(screen.getByText('External')).toBeInTheDocument();
    expect(screen.getByText('Stream')).toBeInTheDocument();
    expect(screen.getByText('Feed')).toBeInTheDocument();
    expect(screen.getAllByText('Utils.Or').length).toBeGreaterThan(1);
  });
});
