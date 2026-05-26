import React, { useMemo, useState } from 'react';
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

function cleanHandle(value) {
  const raw = String(value || '').trim().replace(/^@+/, '').replace(/[^a-zA-Z0-9._]/g, '').slice(0, 28);
  return raw ? `@${raw}` : '';
}

export function LoginScreen({ onSave }) {
  const { palette, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const phoneOk = cleanPhone(phone).length >= 6;
  const handleValue = useMemo(() => cleanHandle(handle), [handle]);
  const canLogin = phoneOk;
  const canRegister = phoneOk && name.trim().length >= 2 && handleValue.length >= 3;

  const setNextMode = (next) => {
    setError('');
    setMode(next);
  };

  const submit = async () => {
    const isRegister = mode === 'register';
    const allowed = isRegister ? canRegister : canLogin;
    setError('');
    if (!allowed || busy) return;
    setBusy(true);
    try {
      await onSave({
        mode,
        phone: phone.trim(),
        name: isRegister ? name.trim() : '',
        handle: isRegister ? handleValue : '',
      });
    } catch (e) {
      setError(e?.message || 'Не удалось войти');
    } finally {
      setBusy(false);
    }
  };

  const disabled = mode === 'register' ? !canRegister || busy : !canLogin || busy;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.wrap, { backgroundColor: palette.bg }]}> 
      <View style={[styles.statusOverlay, { height: insets.top, backgroundColor: isDark ? '#101018' : '#F7F6FF' }]} />
      <View style={[styles.blobA, { backgroundColor: isDark ? 'rgba(242,45,143,.16)' : 'rgba(242,45,143,.11)' }]} />
      <View style={[styles.blobB, { backgroundColor: isDark ? 'rgba(47,123,255,.14)' : 'rgba(47,123,255,.10)' }]} />

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 28 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={[styles.welcome, { color: palette.ink }]}>Добро пожаловать в</Text>
          <Image source={assets.fullLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={[styles.sheet, { backgroundColor: isDark ? '#101018' : '#FFFFFF', borderColor: palette.line }]}> 
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

            {mode === 'register' ? (
              <>
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
                <View style={styles.fieldBlock}>
                  <Text style={[styles.label, { color: palette.muted }]}>Никнейм</Text>
                  <Input
                    value={handle}
                    onChangeText={setHandle}
                    placeholder="nickname"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessibilityLabel="Никнейм профиля"
                    className="rounded-[22px]"
                  />
                </View>
              </>
            ) : null}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.modeActions}>
          <Pressable
            onPress={() => mode === 'login' ? submit() : setNextMode('login')}
            disabled={mode === 'login' && disabled}
            style={({ pressed }) => [styles.modeSelect, mode === 'login' && styles.modeSelectActive, mode === 'login' && disabled && styles.disabled, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ disabled: mode === 'login' && disabled, selected: mode === 'login' }}
            accessibilityLabel="Войти"
          >
            <RNText style={[styles.modeSelectText, mode === 'login' && styles.modeSelectTextActive]}>Войти</RNText>
          </Pressable>
          <Pressable
            onPress={() => mode === 'register' ? submit() : setNextMode('register')}
            disabled={mode === 'register' && disabled}
            style={({ pressed }) => [styles.modeSelect, mode === 'register' && styles.modeSelectActive, mode === 'register' && disabled && styles.disabled, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityState={{ disabled: mode === 'register' && disabled, selected: mode === 'register' }}
            accessibilityLabel="Зарегистрироваться"
          >
            <RNText style={[styles.modeSelectText, mode === 'register' && styles.modeSelectTextActive]}>Зарегистрироваться</RNText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  statusOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 22 },
  blobA: { position: 'absolute', width: 250, height: 250, borderRadius: 125, left: -120, top: 70 },
  blobB: { position: 'absolute', width: 270, height: 270, borderRadius: 135, right: -105, bottom: 72 },
  hero: { alignItems: 'center', marginBottom: 22 },
  welcome: { textAlign: 'center', fontSize: 24, lineHeight: 30, fontWeight: '900', letterSpacing: -0.35, marginBottom: 6 },
  logo: { alignSelf: 'center', width: 232, height: 92 },
  sheet: { borderWidth: 1, borderRadius: 34, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 24, ...shadow },
  form: { gap: 15 },
  fieldBlock: { gap: 8 },
  label: { paddingHorizontal: 3, fontSize: 13, fontWeight: '900' },
  error: { marginTop: 14, color: '#D64265', fontSize: 13, fontWeight: '900' },
  modeActions: { gap: 10, marginTop: 18 },
  modeSelect: { width: '100%', minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.88)', borderWidth: 1, borderColor: 'rgba(230,225,241,.92)' },
  modeSelectActive: { backgroundColor: '#F22D8F', borderColor: '#F22D8F', shadowColor: '#F22D8F', shadowOpacity: 0.22, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  modeSelectText: { color: '#2A2740', fontSize: 16, fontWeight: '900' },
  modeSelectTextActive: { color: '#FFFFFF' },
  disabled: { opacity: 0.58, shadowOpacity: 0 },
  pressed: { transform: [{ scale: 0.985 }] },
});
