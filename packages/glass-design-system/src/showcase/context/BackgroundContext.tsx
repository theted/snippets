import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { PATTERNS, type PatternId, BG_PRESETS, makeHueGradient, type BgId } from 'glass-design-system';

export { PATTERNS, type PatternId, BG_PRESETS, makeHueGradient, type BgId };

// PATTERNS, PatternId, BG_PRESETS, BgId, makeHueGradient imported from library above

// ── Context ───────────────────────────────────────────────────────────────────

interface BackgroundState {
  bgId: BgId;
  customHue: number | null;
  backdropIntensity: number;
  patternId: PatternId;
  showCustom: boolean;
  copied: boolean;
  activeGradient: string;
  activePattern: (typeof PATTERNS)[number];
  isDawn: boolean;
  setBgId: (id: BgId) => void;
  setCustomHue: (hue: number | null) => void;
  setBackdropIntensity: (v: number) => void;
  setPatternId: (id: PatternId) => void;
  setShowCustom: (v: boolean | ((prev: boolean) => boolean)) => void;
  handleCopy: () => void;
}

const BackgroundContext = createContext<BackgroundState | null>(null);

export function BackgroundProvider({ children }: PropsWithChildren) {
  const [bgId, setBgId] = useState<BgId>('night');
  const [customHue, setCustomHue] = useState<number | null>(null);
  const [backdropIntensity, setBackdropIntensity] = useState(1.0);
  const [patternId, setPatternId] = useState<PatternId>('none');
  const [showCustom, setShowCustom] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeGradient = useMemo(
    () => (customHue !== null
      ? makeHueGradient(customHue, backdropIntensity)
      : BG_PRESETS.find((b) => b.id === bgId)!.gradient),
    [bgId, customHue, backdropIntensity],
  );

  const activePattern = useMemo(
    () => PATTERNS.find((p) => p.id === patternId)!,
    [patternId],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(activeGradient.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const value = useMemo<BackgroundState>(() => ({
    bgId,
    customHue,
    backdropIntensity,
    patternId,
    showCustom,
    copied,
    activeGradient,
    activePattern,
    isDawn: bgId === 'dawn' && customHue === null,
    setBgId,
    setCustomHue,
    setBackdropIntensity,
    setPatternId,
    setShowCustom,
    handleCopy,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [bgId, customHue, backdropIntensity, patternId, showCustom, copied, activeGradient, activePattern]);

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground(): BackgroundState {
  const ctx = useContext(BackgroundContext);
  if (!ctx) throw new Error('useBackground must be used within BackgroundProvider');
  return ctx;
}
