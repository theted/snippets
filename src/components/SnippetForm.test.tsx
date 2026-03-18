import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SnippetForm from './SnippetForm';

vi.mock('./CodeEditor', () => ({
  default: ({
    id, value, onChange, placeholder,
  }: {
    id?: string; value: string; onChange: (v: string) => void; placeholder?: string;
  }) => React.createElement('textarea', {
    id,
    value,
    placeholder,
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value),
  }),
}));

test('renders "Create snippet" heading in create mode', () => {
  render(<SnippetForm onSubmit={vi.fn()} closeModal={vi.fn()} />);
  expect(screen.getByRole('heading', { name: /create snippet/i })).toBeInTheDocument();
});

test('renders "Edit snippet" heading in edit mode', () => {
  render(<SnippetForm isEditing onSubmit={vi.fn()} closeModal={vi.fn()} />);
  expect(screen.getByRole('heading', { name: /edit snippet/i })).toBeInTheDocument();
});

test('renders all form fields', () => {
  render(<SnippetForm onSubmit={vi.fn()} closeModal={vi.fn()} />);
  expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
  expect(screen.getByLabelText(/^code$/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText('Description (optional)')).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /language/i })).toBeInTheDocument();
});

test('pre-fills fields from defaultValues', () => {
  render(
    <SnippetForm
      defaultValues={{ title: 'Existing title', content: 'console.log(1)' }}
      onSubmit={vi.fn()}
      closeModal={vi.fn()}
    />,
  );
  expect(screen.getByPlaceholderText('Title')).toHaveValue('Existing title');
  expect(screen.getByLabelText(/^code$/i)).toHaveValue('console.log(1)');
});

test('calls onSubmit with entered form values', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<SnippetForm onSubmit={onSubmit} closeModal={vi.fn()} />);

  await user.type(screen.getByPlaceholderText('Title'), 'My Title');
  await user.type(screen.getByLabelText(/^code$/i), 'const x = 1;');
  await user.click(screen.getByRole('button', { name: /^create$/i }));

  expect(onSubmit).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'My Title', content: 'const x = 1;' }),
  );
});

test('shows "Update" submit button in edit mode', () => {
  render(<SnippetForm isEditing onSubmit={vi.fn()} closeModal={vi.fn()} />);
  expect(screen.getByRole('button', { name: /^update$/i })).toBeInTheDocument();
});

test('calls closeModal when cancel is clicked', async () => {
  const closeModal = vi.fn();
  const user = userEvent.setup();
  render(<SnippetForm onSubmit={vi.fn()} closeModal={closeModal} />);
  await user.click(screen.getByRole('button', { name: /cancel/i }));
  expect(closeModal).toHaveBeenCalled();
});
