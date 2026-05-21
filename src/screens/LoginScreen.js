import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { assets } from '../assets';
import { colors } from '../theme';

export function LoginScreen({ onSave }) {
  const [name, setName] = useState('');
  return <View style={styles.wrap}>
    <Image source={assets.fullLogo} style={styles.logo} resizeMode="contain" />
    <Text style={styles.title}>Ваш профиль</Text>
    <Text style={styles.text}>Введите имя, чтобы публиковать Миги, писать сообщения и играть с другими пользователями.</Text>
    <TextInput value={name} onChangeText={setName} placeholder="Имя" placeholderTextColor={colors.muted} style={styles.input} />
    <Pressable onPress={() => onSave(name)} style={styles.button}><Text style={styles.buttonText}>Войти</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', padding: 24 },
  logo: { width: 250, height: 112, alignSelf: 'center', marginBottom: 28 },
  title: { color: colors.ink, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  text: { color: colors.muted, lineHeight: 22, textAlign: 'center', marginVertical: 14 },
  input: { height: 54, borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 18, color: colors.ink },
  button: { marginTop: 14, height: 56, borderRadius: 28, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.white, fontWeight: '900', fontSize: 16 }
});
