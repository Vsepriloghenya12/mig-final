import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../theme';
import { Icon } from './ui/Icon';

const tabs = [
  ['feed', 'home', 'Лента'], ['video', 'video', 'Видео'],
  ['create', 'plus', 'Миг'], ['nearby', 'near', 'Рядом'], ['profile', 'profile', 'Профиль']
];

export function BottomNav({ active, setActive }) {
  return (
    <View style={styles.bar}>{tabs.map(([key, icon, label]) => {
      const on = active === key;
      return <Pressable key={key} onPress={() => setActive(key)} style={[styles.item, key === 'create' && styles.create]}>
        <View style={[styles.icon, on && styles.activeIcon, key === 'create' && styles.createIcon]}><Icon name={icon} size={key === 'create' ? 28 : 22} active={on || key === 'create'} color={key === 'create' ? colors.white : undefined} /></View>
        <Text style={[styles.label, on && styles.activeLabel]}>{label}</Text>
      </Pressable>;
    })}</View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 16, right: 16, bottom: 14, height: 76, borderRadius: 34, backgroundColor: 'rgba(255,255,255,.94)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: 'rgba(232,229,242,.9)', ...shadow },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  icon: { height: 29, minWidth: 32, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  activeIcon: { backgroundColor: '#FFF1F8' },
  create: { marginTop: -18 },
  createIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.hot, shadowColor: colors.hot, shadowOpacity: .33, shadowRadius: 16, elevation: 8 },
  label: { fontSize: 11, color: colors.muted, fontWeight: '800' },
  activeLabel: { color: colors.hot }
});
