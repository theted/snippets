import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StatsLanguageBreakdown from './StatsLanguageBreakdown';

test('renders each language row as a link to its language archive page', () => {
  render(
    <MemoryRouter>
      <StatsLanguageBreakdown
        languages={[
          { language: 'javascript', count: 2, totalBytes: 2048 },
          { language: 'sql', count: 1, totalBytes: 512 },
        ]}
      />
    </MemoryRouter>,
  );

  expect(screen.getByRole('link', { name: /javascript/i })).toHaveAttribute(
    'href',
    '/language/javascript',
  );
  expect(screen.getByRole('link', { name: /sql/i })).toHaveAttribute('href', '/language/sql');
});
