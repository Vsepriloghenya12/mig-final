import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useTheme } from '../theme-context';
import { Icon } from './ui/MigIcon';

const tabs = [
  ['feed', 'home', 'Лента'],
  ['video', 'video', 'Видео'],
  ['create', 'create', 'Близз'],
  ['nearby', 'near', 'Рядом'],
  ['profile', 'profile', 'Профиль'],
];

export function BottomNav({ active, setActive, hidden = false }) {
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: hidden ? 112 + Math.max(insets.bottom, 0) : 0,
      duration: hidden ? 220 : 190,
      useNativeDriver: true,
    }).start();
  }, [hidden, insets.bottom, translateY]);

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: isDark ? '#000000' : '#FFFFFF',
          borderColor: isDark ? 'rgba(255,255,255,.12)' : 'rgba(20,18,38,.10)',
          transform: [{ translateY }],
        },
      ]}
      accessibilityRole="tablist"
    >
      {tabs.map(([key, icon, label]) => {
        const on = active === key;
        const main = key === 'create';
        return (
          <Pressable
            key={key}
            onPress={() => setActive(key)}
            style={styles.item}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: on }}
          >
            <View style={styles.iconSlot}>
              <Icon name={icon} size={main ? 54 : 46} active={on || main} color={on ? colors.hot : palette.muted} />
            </View>
            <Text numberOfLines={1} style={[styles.label, { color: on ? colors.hot : palette.muted }]}>{label}</Text>
            <View style={[styles.marker, on ? styles.markerActive : null]} />
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlot: {
    width: 58,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  marker: {
    marginTop: 3,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  markerActive: {
    backgroundColor: colors.hot,
  },
});
