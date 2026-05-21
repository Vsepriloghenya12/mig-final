import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { assets } from '../assets';
import { topInset } from '../theme';
import { MailIcon } from './ui/Icon';

export function Header({ onMessages }) {
  return (
    <View style={styles.wrap}>
      <Image source={assets.headerLogo} style={styles.logo} resizeMode="contain" />
      <Pressable onPress={onMessages} style={styles.button}><MailIcon /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: topInset, height: topInset + 66, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 142, height: 52 },
  button: { borderRadius: 25 }
});
