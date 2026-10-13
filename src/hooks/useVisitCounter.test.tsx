import { act, render } from '@testing-library/react';
import { MemoryRouter, useNavigate, type NavigateFunction } from 'react-router-dom';
import useVisitCounter from './useVisitCounter';

const requested: string[] = [];

class FakeImage {
  set src(url: string) {
    requested.push(url);
  }
}

let navigate: NavigateFunction;

const Probe = () => {
  useVisitCounter();
  navigate = useNavigate();
  return null;
};

beforeEach(() => {
  requested.length = 0;
  vi.stubGlobal('Image', FakeImage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('counts every route, sending the referrer only with the first', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Probe />
    </MemoryRouter>
  );

  act(() => navigate('/docs'));
  act(() => navigate('/docs?tab=keys'));

  expect(requested).toEqual([
    `https://visits.sundbergsolutions.se/v.gif?s=snippets&r=${encodeURIComponent(document.referrer)}`,
    'https://visits.sundbergsolutions.se/v.gif?s=snippets',
  ]);
});
