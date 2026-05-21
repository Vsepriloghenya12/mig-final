import { Platform, StatusBar } from 'react-native';

export const colors = {
  bg: '#FBFAFF', ink: '#15142D', text: '#25223C', muted: '#77728D',
  line: '#ECE8F6', faint: '#F5F1FE', white: '#FFFFFF', pink: '#F22D8F',
  hot: '#FF2D8F', violet: '#7B5CFF', blue: '#2F7BFF', coral: '#FF6B6B',
  peach: '#FFB27A', green: '#36CFA1', yellow: '#FFC44D', black: '#050510'
};
export const moodColors = {
  joy: colors.yellow, love: colors.pink, calm: colors.blue, energy: colors.coral,
  dream: colors.violet, focus: colors.green, default: colors.hot
};
export const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 8 : 8;
export const shadow = {
  shadowColor: '#23164D', shadowOpacity: 0.08, shadowRadius: 18,
  shadowOffset: { width: 0, height: 9 }, elevation: 5
};
