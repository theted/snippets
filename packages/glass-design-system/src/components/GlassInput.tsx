import React, { useState } from 'react';
import { useGlass } from '../context/GlassContext';

// ── Colour constants (mirror glass.ts) ─────────────────────────────────────

const EDGE    = '0.48 0.06 248';
const EDGE_HI = '0.69 0.13 240';
const LIGHT   = '0.82 0.1  230';
const GLOW_TR = '0.52 0.24 238';
const ACCENT  = '0.72 0.14 236';
const BG_L    = '0.18 0.022 254';
const BG_HI   = '0.22 0.026 250';

export type GlassInputVariant = 'input' | 'textarea' | 'select';

type SharedProps = {
    /** Blur amount in px for the field backdrop-filter. Default: 16 */
    fieldBlur?: number;
    /** Extra className for the outer wrapper div. */
    wrapperClassName?: string;
    /** Style applied to the outer wrapper div. */
    wrapperStyle?: React.CSSProperties;
    /** Whether to show the top-edge shimmer line. Default: true */
    shimmer?: boolean;
};

// ── GlassInputWrap ────────────────────────────────────────────────────────────
// Standalone wrapper — use when you need to apply glass treatment to your
// own <input>, <textarea>, or <select> element.
//
// ```tsx
// <GlassInputWrap>
//   <input className="block w-full bg-transparent px-5 py-4 focus:outline-none" />
// </GlassInputWrap>
// ```

type WrapProps = React.PropsWithChildren<
    SharedProps & {
        /** Controlled focus state — useful when wrapping <select> or custom elements. */
        focused?: boolean;
        /** Border-radius CSS value. Default: '1.4rem' */
        radius?: string;
    }
>;

export const GlassInputWrap: React.FC<WrapProps> = ({
    children,
    focused: controlledFocused,
    fieldBlur = 16,
    radius = '1.4rem',
    wrapperClassName = '',
    wrapperStyle,
    shimmer = true,
}) => {
    const [uncontrolledFocused, setUncontrolledFocused] = useState(false);
    const isFocused = controlledFocused ?? uncontrolledFocused;
    const { opacity } = useGlass();

    // Scale alphas against global opacity so the field darkens/lightens
    // proportionally with the rest of the glass system.
    function a(base: number) { return Math.round(base * opacity * 1000) / 1000; }

    const wrapStyle: React.CSSProperties = {
        position: 'relative',
        borderRadius: radius,
        backdropFilter: `blur(${fieldBlur}px)`,
        background: isFocused
            ? `oklch(${BG_HI} / ${a(0.60)})`
            : `oklch(${BG_L}  / ${a(0.42)})`,
        border: `1px solid oklch(${isFocused ? EDGE_HI : EDGE} / ${isFocused ? 0.55 : 0.28})`,
        boxShadow: isFocused
            ? [
                `0 0 0 3px oklch(${ACCENT} / 0.14)`,
                `0 0 28px oklch(${GLOW_TR} / 0.12)`,
                `inset 0 1px 0 oklch(${LIGHT} / 0.18)`,
              ].join(', ')
            : `inset 0 1px 0 oklch(${LIGHT} / 0.10)`,
        transition: 'border-color 300ms ease-out, box-shadow 300ms ease-out, background 300ms ease-out',
        ...wrapperStyle,
    };

    return (
        <div
            className={wrapperClassName}
            style={wrapStyle}
            onFocus={() => { if (controlledFocused === undefined) setUncontrolledFocused(true); }}
            onBlur={() => { if (controlledFocused === undefined) setUncontrolledFocused(false); }}
        >
            {shimmer && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: '10%',
                        right: '10%',
                        height: '1px',
                        pointerEvents: 'none',
                        background: `linear-gradient(90deg, transparent, oklch(${LIGHT} / 0.22), transparent)`,
                    }}
                />
            )}
            {children}
        </div>
    );
};

// ── GlassInput ────────────────────────────────────────────────────────────────
// A fully glass-styled <input> element. Accepts all standard <input> props.
//
// ```tsx
// <GlassInput
//   type="text"
//   placeholder="Search snippets…"
//   value={query}
//   onChange={(e) => setQuery(e.target.value)}
// />
// ```

type InputProps = React.ComponentPropsWithoutRef<'input'> & SharedProps;

export const GlassInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ fieldBlur, wrapperClassName, wrapperStyle, shimmer, onFocus, onBlur, className, ...props }, ref) => {
        const [focused, setFocused] = useState(false);
        return (
            <GlassInputWrap
                focused={focused}
                fieldBlur={fieldBlur}
                wrapperClassName={wrapperClassName}
                wrapperStyle={wrapperStyle}
                shimmer={shimmer}
            >
                <input
                    ref={ref}
                    {...props}
                    className={`block w-full appearance-none bg-transparent px-5 py-4 text-base leading-normal text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none ${className ?? ''}`}
                    onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); onBlur?.(e); }}
                />
            </GlassInputWrap>
        );
    }
);

GlassInput.displayName = 'GlassInput';

// ── GlassTextarea ─────────────────────────────────────────────────────────────
// A glass-styled <textarea>. Accepts all standard <textarea> props.

type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> & SharedProps;

export const GlassTextarea: React.FC<TextareaProps> = ({
    fieldBlur, wrapperClassName, wrapperStyle, shimmer, onFocus, onBlur, className, ...props
}) => {
    const [focused, setFocused] = useState(false);
    return (
        <GlassInputWrap
            focused={focused}
            fieldBlur={fieldBlur}
            radius="1.6rem"
            wrapperClassName={wrapperClassName}
            wrapperStyle={wrapperStyle}
            shimmer={shimmer}
        >
            <textarea
                {...props}
                className={`block w-full appearance-none bg-transparent px-5 py-4 text-base leading-7 text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none resize-none ${className ?? ''}`}
                onFocus={(e) => { setFocused(true); onFocus?.(e); }}
                onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            />
        </GlassInputWrap>
    );
};

export default GlassInput;
