import { Platform, StatusBar } from 'react-native';

export const colors = {
  bg: '#FBFAFF', surface: '#FFFFFF', ink: '#15142D', text: '#28243E', muted: '#7D7890',
  line: '#ECE8F6', faint: '#F6F2FF', softPink: '#FFF0F7', pink: '#F22D8F', hot: '#F22D8F',
  violet: '#7B5CFF', blue: '#2F7BFF', coral: '#FF6B6B', peach: '#FFB27A',
  green: '#36CFA1', yellow: '#FFC44D', black: '#050510', white: '#FFFFFF'
};
export const moodColors = {
  joy: colors.yellow, love: colors.pink, calm: colors.blue, energy: colors.coral,
  dream: colors.violet, focus: colors.green, default: colors.hot
};
export const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 6 : 8;
export const shadow = {
  shadowColor: '#22164E', shadowOpacity: 0.08, shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 }, elevation: 5
};
export const softShadow = {
  shadowColor: '#1A1433', shadowOpacity: 0.05, shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 }, elevation: 3
};
