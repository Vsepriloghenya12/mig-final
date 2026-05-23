import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { bottomInset, colors, shadow } from '../theme';
import { Icon } from './ui/Icon';

const tabs = [
  ['feed', 'home', 'Лента'], ['video', 'video', 'Видео'], ['create', 'create', 'Миг'],
  ['nearby', 'near', 'Рядом'], ['profile', 'profile', 'Профиль']
];

export function BottomNav({ active, setActive }) {
  return <View style={styles.bar}>{tabs.map(([key, icon, label]) => {
    const on = active === key;
    const main = key === 'create';
    return <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={label} onPress={() => setActive(key)} style={[styles.item, main && styles.mainItem]}>
      <View style={[styles.iconSlot, main && styles.mainIcon, on && !main && styles.activeSlot]}>
        <Icon name={icon} size={main ? 36 : 23} active={on || main} color={main ? colors.white : undefined} />
      </View>
      <Text numberOfLines={1} style={[styles.label, on && styles.activeLabel, main && styles.mainLabel]}>{label}</Text>
    </Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 14, right: 14, bottom: bottomInset, height: 82, borderRadius: 32, backgroundColor: 'rgba(255,255,255,.98)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: 'rgba(236,232,246,.95)', paddingHorizontal: 4, ...shadow },
  item: { flex: 1, height: 68, alignItems: 'center', justifyContent: 'center', gap: 2 },
  mainItem: { marginTop: -28 },
  iconSlot: { width: 38, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activeSlot: { backgroundColor: colors.activePink, borderWidth: 1, borderColor: 'rgba(242,45,143,.12)' },
  mainIcon: { width: 62, height: 62, borderRadius: 23, backgroundColor: colors.hot, shadowColor: colors.hot, shadowOpacity: .32, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 9 },
  label: { fontSize: 10, color: colors.muted, fontWeight: '900', marginTop: 2 },
  activeLabel: { color: colors.hot },
  mainLabel: { color: colors.hot, marginTop: 4 }
});
