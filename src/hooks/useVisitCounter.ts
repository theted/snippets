import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const PIXEL = 'https://visits.sundbergsolutions.se/v.gif?s=snippets';

// Counts a view on the shared visit counter (theted/tracking-pixel) for each route. Only the first
// view sends document.referrer: it stays the same through client-side navigation, so sending it
// again would count one referral per page. Views count only on snippets.sundbergsolutions.se.
const useVisitCounter = () => {
  const { pathname } = useLocation();
  const isFirstView = useRef(true);

  useEffect(() => {
    const referrer = isFirstView.current ? `&r=${encodeURIComponent(document.referrer)}` : '';
    isFirstView.current = false;
    new Image().src = PIXEL + referrer;
  }, [pathname]);
};

export default useVisitCounter;
