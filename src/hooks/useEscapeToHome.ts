import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const isFormField = (element: Element | null) => (
  element instanceof HTMLInputElement
  || element instanceof HTMLTextAreaElement
  || element instanceof HTMLSelectElement
);

// Escape returns to the archive from reference pages, unless a form field has focus.
const useEscapeToHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isFormField(document.activeElement)) navigate('/');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
};

export default useEscapeToHome;
