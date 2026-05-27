export const colors = {
  bg: '#F7F2FB',
  surface: '#FFFCFF',
  surfaceSoft: '#FDF7FF',
  ink: '#15142D',
  text: '#28243E',
  muted: '#7D7890',
  line: '#E9E2F4',
  faint: '#F1ECFA',
  softPink: '#FFF0F7',
  pink: '#F22D8F',
  hot: '#F22D8F',
  violet: '#7B5CFF',
  blue: '#2F7BFF',
  coral: '#FF6B6B',
  peach: '#FFB27A',
  green: '#36CFA1',
  yellow: '#FFC44D',
  danger: '#E54868',
  dangerSoft: '#FFF1F4',
  overlay: 'rgba(12,10,22,.36)',
  black: '#050510',
  white: '#FFFFFF'
};
export const moodColors = {
  joy: colors.yellow, love: colors.pink, calm: colors.blue, energy: colors.coral,
  dream: colors.violet, focus: colors.green, default: colors.hot
};
export const radius = { sm: 14, md: 18, lg: 24, xl: 30, pill: 999 };
export const spacing = { screen: 16, card: 16 };
export const shadow = {
  shadowColor: '#22164E', shadowOpacity: 0.09, shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 }, elevation: 5
};
export const softShadow = {
  shadowColor: '#1A1433', shadowOpacity: 0.06, shadowRadius: 14,
  shadowOffset: { width: 0, height: 7 }, elevation: 3
};
export const cardStyle = {
  backgroundColor: colors.surface,
  borderColor: colors.line,
  borderWidth: 1,
  borderRadius: radius.lg,
  ...softShadow
};
