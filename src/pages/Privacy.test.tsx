import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Privacy from './Privacy';

const renderPrivacy = () =>
  render(
    <MemoryRouter initialEntries={['/privacy']}>
      <Routes>
        <Route path="/" element={<p>Archive home</p>} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </MemoryRouter>,
  );

test('explains what Google sign-in shares', () => {
  renderPrivacy();

  expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
  expect(screen.getByText('Signing in with Google')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: "Google's privacy policy" })).toHaveAttribute(
    'href',
    'https://policies.google.com/privacy',
  );
});

test('Escape returns to the archive', async () => {
  renderPrivacy();

  await userEvent.keyboard('{Escape}');

  expect(screen.getByText('Archive home')).toBeInTheDocument();
});
