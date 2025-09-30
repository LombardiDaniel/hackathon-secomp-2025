export const MODULE_COLOR_PALETTE = [
  "#fef3c7", // warm sand
  "#e0f2fe", // sky blue
  "#ede9fe", // lavender
  "#dcfce7", // mint
  "#fee2e2", // blush
  "#f1f5f9"  // slate mist
] as const;

export const getModuleColor = (index: number): string => {
  const paletteSize = MODULE_COLOR_PALETTE.length;
  const normalized = ((index % paletteSize) + paletteSize) % paletteSize;
  return MODULE_COLOR_PALETTE[normalized];
};
