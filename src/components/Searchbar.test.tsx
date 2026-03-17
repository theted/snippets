import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Searchbar from './Searchbar';

test('renders the search input', () => {
  render(<Searchbar onSearch={vi.fn()} />);
  expect(screen.getByPlaceholderText(/search snippets/i)).toBeInTheDocument();
});

test('shows "Showing every saved snippet" status by default', () => {
  render(<Searchbar onSearch={vi.fn()} />);
  expect(screen.getByText(/showing every saved snippet/i)).toBeInTheDocument();
});

test('shows "Filtering: <term>" status while a search is active', async () => {
  const user = userEvent.setup();
  render(<Searchbar onSearch={vi.fn()} />);
  await user.type(screen.getByPlaceholderText(/search snippets/i), 'react');
  expect(screen.getByText(/filtering: react/i)).toBeInTheDocument();
});

test('calls onSearch with the typed value on each keystroke', async () => {
  const onSearch = vi.fn();
  const user = userEvent.setup();
  render(<Searchbar onSearch={onSearch} />);
  await user.type(screen.getByPlaceholderText(/search snippets/i), 'go');
  // onSearch is called once per character
  expect(onSearch).toHaveBeenLastCalledWith('go');
});
