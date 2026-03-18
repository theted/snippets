import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { gsap } from 'gsap';

export type ToastVariant = 'success' | 'error';

type Props = {
  message: string;
  onDismiss: () => void;
  variant?: ToastVariant;
  /** ms before auto-dismiss. Defaults: success=2400, error=5000. Pass 0 to disable auto-dismiss. */
  duration?: number;
};

const VARIANT_STYLES = {
  success: {
    background:   'linear-gradient(135deg, oklch(0.22 0.028 254 / 0.72), oklch(0.18 0.022 255 / 0.82))',
    border:       '1px solid oklch(0.48 0.06 248 / 0.32)',
    boxShadow:    '0 8px 40px oklch(0.05 0.015 250 / 0.52), inset 0 1px 0 oklch(0.8 0.1 230 / 0.18)',
    shimmer:      'linear-gradient(90deg, transparent, oklch(0.88 0.12 228 / 0.5), transparent)',
    iconColor:    'oklch(0.72 0.14 236)',
    icon:         '✓',
    textColor:    'oklch(0.78 0.04 250)',
  },
  error: {
    background:   'linear-gradient(135deg, oklch(0.20 0.05 22 / 0.76), oklch(0.16 0.04 20 / 0.86))',
    border:       '1px solid oklch(0.52 0.14 28 / 0.44)',
    boxShadow:    '0 8px 40px oklch(0.10 0.04 20 / 0.52), inset 0 1px 0 oklch(0.72 0.12 30 / 0.22)',
    shimmer:      'linear-gradient(90deg, transparent, oklch(0.78 0.12 30 / 0.5), transparent)',
    iconColor:    'oklch(0.72 0.18 38)',
    icon:         '⚠',
    textColor:    'oklch(0.82 0.06 38)',
  },
} as const;

const DEFAULT_DURATION: Record<ToastVariant, number> = { success: 2400, error: 5000 };

const Toast: React.FC<Props> = ({ message, onDismiss, variant = 'success', duration }) => {
  const ref    = useRef<HTMLDivElement>(null);
  const tlRef  = useRef<gsap.core.Timeline | null>(null);
  const s      = VARIANT_STYLES[variant];
  const ms     = duration ?? DEFAULT_DURATION[variant];

  // Animate out, then call onDismiss — used by both auto-dismiss and the × button.
  const animateDismiss = () => {
    if (!ref.current) { onDismiss(); return; }
    tlRef.current?.kill();
    gsap.to(ref.current, {
      opacity: 0, y: -10, scale: 0.97,
      duration: 0.3, ease: 'power2.in',
      onComplete: onDismiss,
    });
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Enter: slide up + fade in
    tl.fromTo(
      el,
      { y: 24, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
    );

    // Auto-dismiss after hold (skipped when ms === 0)
    if (ms > 0) {
      tl.to(el, { opacity: 0, y: -10, scale: 0.97, duration: 0.4, ease: 'power2.in' }, `+=${ms / 1000}`);
      tl.call(onDismiss);
    }

    return () => { tl.kill(); };
  }, [ms, onDismiss]);

  return ReactDOM.createPortal(
    <div
      ref={ref}
      role={variant === 'error' ? 'alert' : 'status'}
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      style={{
        position:       'fixed',
        bottom:         '2.5rem',
        left:           '50%',
        transform:      'translateX(-50%)',
        zIndex:         9999,
        pointerEvents:  variant === 'error' ? 'auto' : 'none',
        maxWidth:       '36rem',
        background:     s.background,
        backdropFilter: 'blur(28px)',
        border:         s.border,
        borderRadius:   '9999px',
        boxShadow:      s.boxShadow,
        padding:        '0.75rem 1.6rem',
        display:        'flex',
        alignItems:     'center',
        gap:            '0.6rem',
      }}
    >
      {/* Top-edge shimmer */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          inset:        '0 0 auto 0',
          height:       '1px',
          borderRadius: '9999px 9999px 0 0',
          background:   s.shimmer,
          pointerEvents: 'none',
        }}
      />

      {/* Variant icon */}
      <span style={{ fontSize: '0.82rem', color: s.iconColor, lineHeight: 1, flexShrink: 0 }}>
        {s.icon}
      </span>

      {/* Message */}
      <span style={{
        fontSize:           '0.75rem',
        fontWeight:         600,
        letterSpacing:      '0.14em',
        textTransform:      'uppercase',
        color:              s.textColor,
        WebkitFontSmoothing: 'antialiased',
        lineHeight:         1.4,
      }}>
        {message}
      </span>

      {/* Dismiss button — error toasts only */}
      {variant === 'error' && (
        <button
          type="button"
          onClick={animateDismiss}
          aria-label="Dismiss"
          style={{
            marginLeft:  '0.5rem',
            flexShrink:  0,
            background:  'none',
            border:      'none',
            cursor:      'pointer',
            padding:     '0 0.1rem',
            color:       s.textColor,
            opacity:     0.55,
            fontSize:    '1rem',
            lineHeight:  1,
            transition:  'opacity 150ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; }}
        >
          ×
        </button>
      )}
    </div>,
    document.body,
  );
};

export default Toast;
