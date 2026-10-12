import type { AuthUser } from '../../types';

const getInitials = (name: string) => name
  .split(' ')
  .map((part) => part.trim().charAt(0))
  .filter(Boolean)
  .slice(0, 2)
  .join('');

const sizes = {
  sm: 'h-6 w-6 text-[0.6rem]',
  lg: 'h-11 w-11 text-sm',
};

type Props = {
  user: AuthUser;
  size: keyof typeof sizes;
};

const AccountAvatar = ({ user, size }: Props) => {
  const base = `${sizes[size]} shrink-0 rounded-full border border-[var(--color-border-strong)]`;

  return user.avatarUrl ? (
    <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" className={`${base} object-cover`} />
  ) : (
    <span
      aria-hidden="true"
      className={`${base} inline-flex items-center justify-center bg-[var(--color-surface-strong)] font-semibold uppercase text-[var(--color-text)]`}
    >
      {getInitials(user.displayName)}
    </span>
  );
};

export default AccountAvatar;
