import React from 'react';
import { Link } from 'react-router-dom';
import { GlassPanel, GlassPill } from 'glass-design-system';
import Icon from '../components/Icon';
import Kicker from '../components/Kicker';
import useEscapeToHome from '../hooks/useEscapeToHome';

const LAST_UPDATED = '13 October 2026';
const REPOSITORY_URL = 'https://github.com/theted/snippets';
const GOOGLE_PRIVACY_URL = 'https://policies.google.com/privacy';

const linkClass = 'text-[var(--color-text)] underline underline-offset-4 hover:opacity-80';

type Section = {
  label: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    label: 'Signing in with Google',
    body: (
      <>
        Anyone can read snippets without an account. You only need to sign in with Google to
        create snippets, or to edit and delete your own. Signing in gives us your Google account
        ID, email address, name and profile picture, and nothing else: no access to your Gmail,
        Drive, contacts or anything else in your Google account. We store these details so we
        know which snippets are yours.
      </>
    ),
  },
  {
    label: 'Your snippets',
    body: (
      <>
        Snippets are public. Anyone can read a snippet you create. Each snippet is linked to your
        account so that only you can change it, but your name and email address are not shown
        next to it.
      </>
    ),
  },
  {
    label: 'Cookies and browser storage',
    body: (
      <>
        Signing in sets one cookie that keeps you signed in for up to seven days, and signing out
        removes it. Your browser&apos;s local storage holds your preferences (theme, layout, line
        numbers), your favorites, a cache of snippets for faster loading, and your signed-in name,
        email address and picture for display. This data stays in your browser, and clearing this
        site&apos;s data removes it.
      </>
    ),
  },
  {
    label: 'Visit counter',
    body: (
      <>
        Each page you open sends one request to our visit counter at visits.sundbergsolutions.se.
        It keeps daily totals only: page views, how many different visitors came that day, and the
        domain of the site that linked you here. The counter sets no cookie and keeps no IP
        address. To tell visitors apart within a day it uses a one-way code made from your IP
        address and browser type, which changes every day and is deleted once the day is over.
      </>
    ),
  },
  {
    label: 'Google sign-in and server logs',
    body: (
      <>
        The sign-in button is loaded from Google, and{' '}
        <a className={linkClass} href={GOOGLE_PRIVACY_URL} target="_blank" rel="noreferrer">
          Google&apos;s privacy policy
        </a>{' '}
        covers that interaction. Our web server keeps standard access logs (IP address, time,
        requested page and browser type), which are used only to run and secure the site. Apart
        from the visit counter, there are no analytics, ads or third-party trackers.
      </>
    ),
  },
  {
    label: 'Where your data is kept',
    body: (
      <>
        Snippets runs on Amazon Web Services in Ireland (eu-west-1). We never sell or share your
        data with anyone else.
      </>
    ),
  },
  {
    label: 'Deleting your data',
    body: (
      <>
        To have your account and snippets deleted, or to ask what we hold about you, open an issue
        on{' '}
        <a className={linkClass} href={REPOSITORY_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        or reply to the support address shown on Google&apos;s sign-in screen.
      </>
    ),
  },
];

const classes = {
  shell: 'relative z-1 mx-auto w-full max-w-[72rem] px-[clamp(1.25rem,4vw,4rem)] py-[clamp(2rem,5vw,4rem)]',
  title: 'mt-3 font-[var(--font-display)] text-4xl font-[250] tracking-[-0.06em] text-[var(--color-text)] md:text-5xl [text-shadow:0_1px_0_oklch(1_0_0_/_0.14),0_2px_16px_oklch(0_0_0_/_0.3)]',
  body: 'max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]',
};

const Privacy: React.FC = () => {
  useEscapeToHome();

  return (
    <div className="App">
      <div className={classes.shell}>
        <GlassPill as={Link} to="/" size="md">
          <Icon name="home" style={{ fontSize: '0.85em' }} />
          Back to archive
        </GlassPill>

        <GlassPanel
          intensity="strong"
          topGlow
          rounded="rounded-[2.4rem]"
          className="snippet-detail-enter p-8 md:p-10 lg:p-12"
        >
          <div className="relative z-10">
            <Kicker className="text-[0.7rem] tracking-[0.38em]">Last updated {LAST_UPDATED}</Kicker>
            <h1 className={classes.title}>Privacy Policy</h1>
            <p className={`mt-4 ${classes.body}`}>
              Snippets is a personal code archive. It collects as little as it can, and this page
              explains what that is.
            </p>

            {sections.map(({ label, body }) => (
              <section key={label} className="mt-10">
                <Kicker className="mb-3 text-[0.65rem] tracking-[0.36em]">{label}</Kicker>
                <p className={classes.body}>{body}</p>
              </section>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
};

export default Privacy;
