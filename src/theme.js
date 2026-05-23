import { Platform, StatusBar } from 'react-native';

export const colors = {
  bg: '#FBFAFF', surface: '#FFFFFF', surfaceSoft: '#FFFCFF', ink: '#15142D', text: '#28243E', muted: '#7D7890',
  line: '#ECE8F6', lineStrong: '#DED8EC', faint: '#F6F2FF', softPink: '#FFF0F7', pink: '#F22D8F', hot: '#F22D8F',
  violet: '#7B5CFF', blue: '#2F7BFF', coral: '#FF6B6B', peach: '#FFB27A',
  green: '#36CFA1', yellow: '#FFC44D', danger: '#E5484D', black: '#050510', white: '#FFFFFF',
  overlay: 'rgba(12,10,22,.2)', glass: 'rgba(255,255,255,.96)', activePink: 'rgba(242,45,143,.08)'
};
export const radius = { sm: 14, md: 18, lg: 22, xl: 30, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 28 };
export const moodColors = {
  joy: colors.yellow, love: colors.pink, calm: colors.blue, energy: colors.coral,
  dream: colors.violet, focus: colors.green, default: colors.hot
};
export const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 6 : 8;
export const bottomInset = Platform.OS === 'ios' ? 24 : 10;
export const shadow = {
  shadowColor: '#22164E', shadowOpacity: 0.08, shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 }, elevation: 5
};
export const softShadow = {
  shadowColor: '#1A1433', shadowOpacity: 0.05, shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 }, elevation: 3
};
export const cardShadow = {
  shadowColor: '#1A1433', shadowOpacity: 0.07, shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 }, elevation: 4
};
export const buttonShadow = {
  shadowColor: colors.hot, shadowOpacity: 0.24, shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 }, elevation: 6
};
