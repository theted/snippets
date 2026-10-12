import { useEffect, type RefObject } from 'react';

/** Calls `onDismiss` on a pointer press outside `ref`, or on Escape, while `isOpen`. */
const useDismiss = (ref: RefObject<HTMLElement | null>, isOpen: boolean, onDismiss: () => void) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onDismiss();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref, isOpen, onDismiss]);
};

export default useDismiss;
