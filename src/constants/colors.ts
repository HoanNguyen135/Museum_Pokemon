// Existing exports — kept for backward compatibility
export const COLORS = {
  primaryText: '#D2C5AB',
  secondary: '#FF6600',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  primaryButton: '#FFCB05',
  primaryBackground: '#2b3151',
} as const;

/**
 * App-wide color palette.
 * All hardcoded hex values in components should reference these constants.
 */
const Colors = {
  // Backgrounds
  background: '#0A0F1F',
  surface: '#151A2D',
  surfaceElevated: '#1F2438',
  cardBackground: '#1F2438',

  // Borders
  border: '#2E3657',
  borderLight: '#37415F',

  // Accent
  accentYellow: '#FFCB05',
  accentGreen: '#34D399',
  accentRed: '#EF4444',
  accentBlue: '#60A5FA',
  accentPurple: '#A78BFA',
  accentPink: '#F472B6',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AAB3D3',
  textMuted: '#9CA3AF',
  textLabel: '#8B95B7',
  textPlaceholder: '#6B7280',

  // Status
  success: '#34D399',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#60A5FA',

  // Price
  priceGreen: '#34D399',
  priceYellow: '#FFCB05',
  priceRed: '#EF4444',

  // Type colors (Pokemon TCG)
  typeFire: '#F08030',
  typeWater: '#6890F0',
  typeGrass: '#78C850',
  typeLightning: '#F8D030',
  typePsychic: '#A040A0',
  typeFighting: '#C03028',
  typeDarkness: '#2F2F2F',
  typeMetal: '#A8A8B0',
  typeFairy: '#EE99AC',
  typeDragon: '#7038F8',
  typeColorless: '#D6D6C2',

  // Rarity colors
  rarityCommon: '#9CA3AF',
  rarityUncommon: '#34D399',
  rarityRare: '#60A5FA',
  rarityRareHolo: '#A78BFA',
  rarityRareUltra: '#F472B6',
  rarityRareSecret: '#EF4444',
  rarityRareRainbow: '#EC4899',
  rarityPromo: '#FBBF24',
} as const;

export default Colors;
