import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assets } from '../assets';
import { Input } from '../components/ui/input';
import { Text } from '../components/ui/text';
import { colors, shadow } from '../theme';
import { useTheme } from '../theme-context';

function cleanPhone(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

export function LoginScreen({ onSave }) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const canLogin = name.trim().length >= 2 && cleanPhone(phone).length >= 6;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.wrap, { backgroundColor: palette.bg }]}> 
      <View style={[styles.statusOverlay, { height: insets.top, backgroundColor: isDark ? '#101018' : '#F7F6FF' }]} />
      <View style={[styles.blobA, { backgroundColor: isDark ? 'rgba(242,45,143,.16)' : 'rgba(242,45,143,.11)' }]} />
      <View style={[styles.blobB, { backgroundColor: isDark ? 'rgba(47,123,255,.14)' : 'rgba(47,123,255,.10)' }]} />
      <View style={[styles.blobC, { backgroundColor: isDark ? 'rgba(255,140,91,.12)' : 'rgba(255,140,91,.09)' }]} />

      <View style={[styles.sheet, { backgroundColor: isDark ? '#101018' : '#FFFFFF', borderColor: palette.line }]}> 
        <View style={styles.logoWrap}>
          <Image source={assets.fullLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: palette.ink }]}>Вход</Text>
          <Text style={[styles.subtitle, { color: palette.muted }]}>Номер телефона и имя — этого достаточно.</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldBlock}>
            <Text style={[styles.label, { color: palette.muted }]}>Телефон</Text>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="+7 999 000 00 00"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
              accessibilityLabel="Номер телефона"
              className="rounded-[22px]"
            />
          </View>
          <View style={styles.fieldBlock}>
            <Text style={[styles.label, { color: palette.muted }]}>Имя</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Как вас зовут"
              textContentType="name"
              autoComplete="name"
              accessibilityLabel="Имя профиля"
              className="rounded-[22px]"
            />
          </View>
        </View>

        <Pressable
          onPress={() => onSave({ name, phone })}
          disabled={!canLogin}
          style={({ pressed }) => [styles.submit, !canLogin && styles.submitDisabled, pressed && canLogin && { transform: [{ scale: 0.985 }] }]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canLogin }}
          accessibilityLabel="Войти в приложение"
        >
          <Text style={styles.submitText}>Войти</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  statusOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  blobA: { position: 'absolute', width: 250, height: 250, borderRadius: 125, left: -120, top: 70 },
  blobB: { position: 'absolute', width: 270, height: 270, borderRadius: 135, right: -105, bottom: 72 },
  blobC: { position: 'absolute', width: 120, height: 120, borderRadius: 60, right: 26, top: 122 },
  sheet: { borderWidth: 1, borderRadius: 34, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24, ...shadow },
  logoWrap: { alignItems: 'center', marginBottom: 18 },
  logo: { width: 230, height: 92 },
  titleBlock: { alignItems: 'center', marginBottom: 22 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { marginTop: 7, textAlign: 'center', fontSize: 15, lineHeight: 21, fontWeight: '800' },
  form: { gap: 14 },
  fieldBlock: { gap: 8 },
  label: { paddingHorizontal: 3, fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  submit: { marginTop: 22, minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.hot, shadowColor: colors.hot, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 4 },
  submitDisabled: { opacity: 0.45, shadowOpacity: 0 },
  submitText: { color: colors.white, fontSize: 17, fontWeight: '900' },
});
