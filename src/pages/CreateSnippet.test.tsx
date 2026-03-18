import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateSnippet from './CreateSnippet';
import * as api from '../utils/api.ts';

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    timeline: vi.fn(() => ({ fromTo: vi.fn(), to: vi.fn(), call: vi.fn(), kill: vi.fn() })),
  },
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
  renderCreateSnippet();

  fireEvent.click(screen.getByRole('button', { name: /create snippet/i }));

  expect(await screen.findByRole('heading', { name: /create snippet/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/^title$/i)).toBeInTheDocument();
});

test('closes the modal after a snippet is saved successfully', async () => {
  vi.mocked(api.post).mockResolvedValue({ id: 99, title: 'New snippet', content: 'x = 1' });

  renderCreateSnippet();

  fireEvent.click(screen.getByRole('button', { name: /create snippet/i }));

  fireEvent.change(await screen.findByLabelText(/^title$/i), {
    target: { value: 'New snippet' },
  });
  fireEvent.change(screen.getByLabelText(/^code$/i), {
    target: { value: 'x = 1' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('calls post with the correct snippet data on save', async () => {
  vi.mocked(api.post).mockResolvedValue({ id: 42, title: 'Hello world', content: 'console.log("hi")' });

  renderCreateSnippet();

  fireEvent.click(screen.getByRole('button', { name: /create snippet/i }));

  fireEvent.change(await screen.findByLabelText(/^title$/i), {
    target: { value: 'Hello world' },
  });
  fireEvent.change(screen.getByLabelText(/^code$/i), {
    target: { value: 'console.log("hi")' },
  });
  fireEvent.click(screen.getByRole('button', { name: /^create$/i }));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith(
      'snippets',
      expect.objectContaining({ title: 'Hello world', content: 'console.log("hi")' }),
    );
  });
});
