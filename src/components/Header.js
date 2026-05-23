import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { assets } from '../assets';
import { colors, topInset } from '../theme';
import { MailIcon } from './ui/Icon';

export function Header({ onMessages }) {
  return (
    <View style={styles.wrap}>
      <Image source={assets.headerLogo} style={styles.logo} resizeMode="contain" />
      <Pressable accessibilityRole="button" accessibilityLabel="Открыть сообщения" onPress={onMessages} hitSlop={12} style={styles.button}><MailIcon /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: topInset, height: topInset + 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(251,250,255,.96)', borderBottomWidth: 1, borderBottomColor: 'rgba(236,232,246,.72)' },
  logo: { width: 116, height: 50 },
  button: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }
});
