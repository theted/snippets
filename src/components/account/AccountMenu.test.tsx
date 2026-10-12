import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthContext } from '../../contexts/authContext';
import AccountMenu from './AccountMenu';

vi.mock('../../config', () => ({ GOOGLE_AUTH_ENABLED: true }));

const user = { id: 1, email: 'ada@example.com', displayName: 'Ada Lovelace' };

const renderMenu = (signOut = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <AuthContext.Provider
      value={{
        authEnabled: true,
        googleClientId: 'client-id',
        user,
        isLoading: false,
        error: null,
        signInWithGoogleCredential: vi.fn(),
        signOut,
        clearError: vi.fn(),
      }}
    >
      <AccountMenu />
    </AuthContext.Provider>,
  );
  return signOut;
};

test('shows the first name and opens the account details', async () => {
  renderMenu();

  const toggle = screen.getByRole('button', { name: 'Account: Ada Lovelace' });
  expect(toggle).toHaveTextContent('Ada');

  await userEvent.click(toggle);

  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('ada@example.com')).toBeInTheDocument();
});

test('Escape closes the menu', async () => {
  renderMenu();

  await userEvent.click(screen.getByRole('button', { name: 'Account: Ada Lovelace' }));
  await userEvent.keyboard('{Escape}');

  expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
});

test('signs out from the menu', async () => {
  const signOut = renderMenu();

  await userEvent.click(screen.getByRole('button', { name: 'Account: Ada Lovelace' }));
  await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

  expect(signOut).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument();
});
