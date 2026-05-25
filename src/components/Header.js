import React from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assets } from '../assets';
import { colors, shadow } from '../theme';
import { useTheme } from '../theme-context';
import { MailIcon } from './ui/MigIcon';

export const HEADER_EXPANDED_HEIGHT = 82;
export const HEADER_COLLAPSED_HEIGHT = 0;
const COLLAPSE_DISTANCE = 92;

export function Header({ onMessages, scrollY }) {
  const insets = useSafeAreaInsets();
  const { palette, isDark, toggleTheme } = useTheme();
  const value = scrollY || new Animated.Value(0);
  const translateY = value.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [0, -(insets.top + 118)],
    extrapolate: 'clamp',
  });
  const cardHeight = value.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [62, 0],
    extrapolate: 'clamp',
  });
  const scale = value.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [1, 0.54],
    extrapolate: 'clamp',
  });
  const opacity = value.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE * 0.72, COLLAPSE_DISTANCE],
    outputRange: [1, 0.52, 0],
    extrapolate: 'clamp',
  });
  const radius = value.interpolate({
    inputRange: [0, COLLAPSE_DISTANCE],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View pointerEvents="box-none" style={[styles.wrap, { paddingTop: insets.top + 4, transform: [{ translateY }], opacity }]}> 
      <Animated.View style={[styles.brandCard, { height: cardHeight, borderRadius: radius, transform: [{ scale }], backgroundColor: isDark ? 'rgba(0,0,0,.92)' : 'rgba(255,255,255,.97)', borderColor: isDark ? 'rgba(255,255,255,.18)' : 'rgba(236,232,246,.96)' }]}> 
        <View style={styles.logoWrap}>
          <Image source={isDark ? assets.headerLogoDark : assets.headerLogo} style={styles.logo} resizeMode="contain" accessible={false} />
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={toggleTheme}
            hitSlop={12}
            style={[styles.button, styles.themeButton, { backgroundColor: isDark ? '#111119' : palette.white, borderColor: palette.line }]}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            <Image source={assets.themeMoon} style={styles.themeIcon} resizeMode="contain" />
          </Pressable>
          <Pressable
            onPress={onMessages}
            hitSlop={12}
            style={[styles.button, styles.messageButton, { backgroundColor: isDark ? '#000000' : colors.white, borderColor: isDark ? palette.line : colors.white }]}
            accessibilityRole="button"
            accessibilityLabel="Открыть сообщения"
          >
            <MailIcon />
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 30,
    paddingHorizontal: 14,
    backgroundColor: 'transparent',
  },
  brandCard: {
    overflow: 'hidden',
    paddingLeft: 16,
    paddingRight: 7,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow,
  },
  logoWrap: { borderRadius: 16 },
  logo: { width: 146, height: 46 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  themeButton: { overflow: 'hidden' },
  messageButton: { backgroundColor: colors.white, borderColor: colors.white },
  themeIcon: { width: 42, height: 42 },
});
