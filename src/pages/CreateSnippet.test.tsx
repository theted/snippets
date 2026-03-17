import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateSnippet from './CreateSnippet';
import * as api from '../utils/api.ts';

vi.mock('gsap', () => ({
  gsap: { to: vi.fn() },
}));

vi.mock('../utils/api.ts', () => ({
  get: vi.fn(),
  post: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

function renderCreateSnippet() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateSnippet />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

test('opens the create snippet dialog', async () => {
  const user = userEvent.setup();

  renderCreateSnippet();

  await user.click(screen.getByRole('button', { name: /create snippet/i }));

  expect(screen.getByRole('heading', { name: /create snippet/i })).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
});

test('closes the modal after a snippet is saved successfully', async () => {
  vi.mocked(api.post).mockResolvedValue({ id: 99, title: 'New snippet', content: 'x = 1' });
  const user = userEvent.setup();

  renderCreateSnippet();

  await user.click(screen.getByRole('button', { name: /create snippet/i }));
  await user.type(screen.getByPlaceholderText('Title'), 'New snippet');
  await user.type(screen.getByPlaceholderText('Content'), 'x = 1');
  await user.click(screen.getByRole('button', { name: /^create$/i }));

  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: /create snippet/i })).not.toBeInTheDocument();
  });
});

test('calls post with the correct snippet data on save', async () => {
  vi.mocked(api.post).mockResolvedValue({ id: 42, title: 'Hello world', content: 'console.log("hi")' });
  const user = userEvent.setup();

  renderCreateSnippet();

  await user.click(screen.getByRole('button', { name: /create snippet/i }));
  await user.type(screen.getByPlaceholderText('Title'), 'Hello world');
  await user.type(screen.getByPlaceholderText('Content'), 'console.log("hi")');
  await user.click(screen.getByRole('button', { name: /^create$/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith(
      'snippets',
      expect.objectContaining({ title: 'Hello world', content: 'console.log("hi")' }),
    );
  });
});
