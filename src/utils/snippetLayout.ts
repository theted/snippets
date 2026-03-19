/**
 * Estimates the ideal card width for a snippet in auto-size layout.
 *
 * Approximates the longest line rendered at 1.18rem monospace (~10.5px/char)
 * plus padding/gutter overhead, clamped to a sensible min/max range.
 */
export function computeCardWidth(content: string): number {
    const longestLine = content.split('\n').reduce((max, line) => Math.max(max, line.length), 0);
    return Math.max(160, Math.min(1400, longestLine * 9 + 100));
}
