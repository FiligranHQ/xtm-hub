/**
 * Computes the right padding (in px) for the card title container so it never
 * overlaps the status-icon cluster rendered in the top-right corner.
 *
 * Formula: icon width (24px) × count + gap between icons (4px) × (count-1) + buffer (8px)
 */
export const computeTitlePaddingRight = (iconCount: number): number => {
  return iconCount * 24 + Math.max(0, iconCount - 1) * 4 + 8;
};
