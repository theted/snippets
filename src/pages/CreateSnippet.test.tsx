import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateSnippet from './CreateSnippet';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
  },
}));

function renderCreateSnippet() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateSnippet />
    </QueryClientProvider>,
  );
}

test('opens the create snippet dialog', async () => {
  const user = userEvent.setup();

  renderCreateSnippet();

  await user.click(screen.getByRole('button', { name: /create snippet/i }));

  expect(screen.getByRole('heading', { name: /create snippet/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
});
