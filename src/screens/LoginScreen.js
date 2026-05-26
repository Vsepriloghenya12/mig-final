import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
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
  const submit = () => {
    if (!canLogin) return;
    onSave({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.wrap, { backgroundColor: palette.bg }]}> 
      <View style={[styles.statusOverlay, { height: insets.top, backgroundColor: isDark ? '#101018' : '#F7F6FF' }]} />
      <View style={[styles.blobA, { backgroundColor: isDark ? 'rgba(242,45,143,.16)' : 'rgba(242,45,143,.11)' }]} />
      <View style={[styles.blobB, { backgroundColor: isDark ? 'rgba(47,123,255,.14)' : 'rgba(47,123,255,.10)' }]} />

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <Image source={assets.fullLogo} style={styles.logo} resizeMode="contain" />

        <View style={[styles.sheet, { backgroundColor: isDark ? '#101018' : '#FFFFFF', borderColor: palette.line }]}> 
          <Text style={[styles.title, { color: palette.ink }]}>Вход</Text>

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
                placeholder="Ваше имя"
                textContentType="name"
                autoComplete="name"
                accessibilityLabel="Имя профиля"
                className="rounded-[22px]"
              />
            </View>
          </View>

          <Pressable
            onPress={submit}
            disabled={!canLogin}
            style={({ pressed }) => [styles.submit, !canLogin && styles.submitDisabled, pressed && canLogin && styles.submitPressed]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canLogin }}
            accessibilityLabel="Войти"
          >
            <RNText style={styles.submitText}>Войти</RNText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  statusOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  blobA: { position: 'absolute', width: 250, height: 250, borderRadius: 125, left: -120, top: 70 },
  blobB: { position: 'absolute', width: 270, height: 270, borderRadius: 135, right: -105, bottom: 72 },
  logo: { alignSelf: 'center', width: 230, height: 104, marginBottom: 22 },
  sheet: { borderWidth: 1, borderRadius: 34, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 24, ...shadow },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -0.6, marginBottom: 20 },
  form: { gap: 14 },
  fieldBlock: { gap: 8 },
  label: { paddingHorizontal: 3, fontSize: 13, fontWeight: '900' },
  submit: { marginTop: 22, minHeight: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.hot, shadowColor: colors.hot, shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 9 }, elevation: 4 },
  submitDisabled: { opacity: 0.62, shadowOpacity: 0 },
  submitPressed: { transform: [{ scale: 0.985 }] },
  submitText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
});
