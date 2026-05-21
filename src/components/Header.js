import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { assets } from '../assets';
import { colors, topInset } from '../theme';
import { MailIcon } from './ui/Icon';

export function Header({ onMessages }) {
  return (
    <View style={styles.wrap}>
      <Image source={assets.headerLogo} style={styles.logo} resizeMode="contain" />
      <Pressable onPress={onMessages} hitSlop={12} style={styles.button}><MailIcon /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: topInset, height: topInset + 58, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bg },
  logo: { width: 116, height: 50 },
  button: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }
});
