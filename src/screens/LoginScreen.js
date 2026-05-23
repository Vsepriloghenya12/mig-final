import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { assets } from '../assets';
import { buttonShadow, cardShadow, colors, topInset } from '../theme';

export function LoginScreen({ onSave }) {
  const [name, setName] = useState('');
  return <View style={styles.wrap}>
    <View style={styles.blobPink} /><View style={styles.blobBlue} />
    <View style={styles.card}>
      <Image source={assets.fullLogo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Ваш профиль</Text>
      <Text style={styles.text}>Введите имя, чтобы публиковать Миги, писать сообщения и играть с другими пользователями.</Text>
      <TextInput accessibilityLabel="Имя профиля" value={name} onChangeText={setName} placeholder="Имя" placeholderTextColor={colors.muted} style={styles.input} />
      <Pressable accessibilityRole="button" accessibilityLabel="Войти" onPress={() => onSave(name)} style={styles.button}><Text style={styles.buttonText}>Войти</Text></Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', paddingTop: topInset, paddingHorizontal: 20 },
  blobPink: { position: 'absolute', left: -80, top: 90, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(242,45,143,.09)' },
  blobBlue: { position: 'absolute', right: -90, bottom: 120, width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(47,123,255,.07)' },
  card: { borderRadius: 34, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 24, ...cardShadow },
  logo: { width: 230, height: 104, alignSelf: 'center', marginBottom: 22 },
  title: { color: colors.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', textAlign: 'center' },
  text: { color: colors.muted, lineHeight: 22, textAlign: 'center', marginVertical: 15, fontWeight: '700' },
  input: { height: 56, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 18, color: colors.ink, fontWeight: '800' },
  button: { marginTop: 14, height: 56, borderRadius: 28, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', ...buttonShadow },
  buttonText: { color: colors.white, fontWeight: '900', fontSize: 16 }
});
