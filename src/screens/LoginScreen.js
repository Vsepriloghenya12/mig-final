import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { ArrowRight, Eye, EyeOff, Lock, Phone, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assets } from '../assets';
import { Text } from '../components/ui/text';

const palette = {
  bg: '#070A13',
  bg2: '#0C1020',
  card: 'rgba(255,255,255,0.082)',
  cardLine: 'rgba(255,255,255,0.12)',
  field: 'rgba(3,7,18,0.34)',
  fieldFocus: 'rgba(3,7,18,0.44)',
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.66)',
  textFaint: 'rgba(255,255,255,0.36)',
  brand: '#F22D8F',
  brand2: '#2F7BFF',
  active: '#FFFFFF',
  activeText: '#111827',
  error: '#FF8EA8',
};

function onlyDigits(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function isPhoneValid(phone) {
  return onlyDigits(phone).length >= 10;
}

function isLoginValid({ phone, password }) {
  return isPhoneValid(phone) && String(password || '').length >= 6;
}

function isRegisterValid({ phone, firstName, lastName, nickname, password }) {
  return (
    isPhoneValid(phone) &&
    String(firstName || '').trim().length >= 2 &&
    String(lastName || '').trim().length >= 2 &&
    String(nickname || '').trim().length >= 2 &&
    String(password || '').length >= 6
  );
}

function normalizeHandle(value) {
  return String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 28);
}

export function LoginScreen({ onSave }) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+7 ');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const canSubmit = useMemo(() => {
    if (mode === 'login') return isLoginValid({ phone, password });
    return isRegisterValid({ phone, firstName, lastName, nickname, password });
  }, [mode, phone, password, firstName, lastName, nickname]);

  const submit = async () => {
    setError('');
    if (!canSubmit) {
      setError(mode === 'login' ? 'Введите телефон и пароль.' : 'Заполните все поля. Пароль — минимум 6 символов.');
      return;
    }
    setBusy(true);
    try {
      const cleanNickname = normalizeHandle(nickname);
      await onSave({
        mode,
        phone,
        password,
        firstName: mode === 'register' ? firstName.trim() : '',
        lastName: mode === 'register' ? lastName.trim() : '',
        name: mode === 'register' ? `${firstName.trim()} ${lastName.trim()}`.trim() : '',
        handle: mode === 'register' ? cleanNickname : '',
      });
    } catch (e) {
      setError(e?.message || (mode === 'login' ? 'Не удалось войти.' : 'Не удалось создать аккаунт.'));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <View pointerEvents="none" style={styles.glowLayer}>
          <View style={[styles.glow, styles.glowCyan]} />
          <View style={[styles.glow, styles.glowPink]} />
          <View style={[styles.glow, styles.glowBlue]} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 26, 42), paddingBottom: insets.bottom + 28 }]}
        >
          <View style={styles.card}>
            <View style={styles.tabs}>
              <TabButton title="Войти" active={mode === 'login'} onPress={() => switchMode('login')} />
              <TabButton title="Зарегистрироваться" active={mode === 'register'} onPress={() => switchMode('register')} />
            </View>

            <View style={styles.form}>
              <View style={styles.fieldsWrap}>
                <PhoneField value={phone} onChange={setPhone} />

                {mode === 'register' ? (
                  <>
                    <Field label="Имя" icon={<UserRound size={20} color={palette.textFaint} strokeWidth={2.2} />}>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Введите имя"
                        placeholderTextColor={palette.textFaint}
                        style={styles.input}
                        returnKeyType="next"
                      />
                    </Field>

                    <Field label="Фамилия" icon={<UserRound size={20} color={palette.textFaint} strokeWidth={2.2} />}>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Введите фамилию"
                        placeholderTextColor={palette.textFaint}
                        style={styles.input}
                        returnKeyType="next"
                      />
                    </Field>

                    <Field label="Никнейм" icon={<UserRound size={20} color={palette.textFaint} strokeWidth={2.2} />}>
                      <TextInput
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Введите никнейм"
                        placeholderTextColor={palette.textFaint}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                      />
                    </Field>
                  </>
                ) : null}

                <PasswordField
                  value={password}
                  onChange={setPassword}
                  show={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                  placeholder={mode === 'login' ? 'Введите пароль' : 'Минимум 6 символов'}
                  onSubmit={submit}
                />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                onPress={submit}
                disabled={busy || !canSubmit}
                style={({ pressed }) => [styles.submit, (busy || !canSubmit) && styles.submitDisabled, pressed && canSubmit ? styles.submitPressed : null]}
              >
                <Text style={styles.submitText}>{busy ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</Text>
                <ArrowRight size={20} color={palette.activeText} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialRow}>
              <SocialButton label="G" color="#4285F4" />
              <SocialButton label="Я" color="#FC3F1D" />
              <SocialButton label="✈" color="#26A5E4" />
              <SocialButton label="" color="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.terms}>Продолжая, вы соглашаетесь с условиями сервиса и политикой конфиденциальности.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TabButton({ title, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && !active ? styles.tabPressed : null]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </Pressable>
  );
}

function PhoneField({ value, onChange }) {
  return (
    <Field label="Номер телефона" icon={<Phone size={20} color={palette.textFaint} strokeWidth={2.2} />}>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="phone-pad"
        placeholder="+7 999 000-00-00"
        placeholderTextColor={palette.textFaint}
        style={styles.input}
        returnKeyType="next"
      />
    </Field>
  );
}

function PasswordField({ value, onChange, show, onToggle, placeholder, onSubmit }) {
  return (
    <Field label="Пароль" icon={<Lock size={20} color={palette.textFaint} strokeWidth={2.2} />}>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={!show}
        placeholder={placeholder}
        placeholderTextColor={palette.textFaint}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <Pressable onPress={onToggle} hitSlop={10} style={styles.eyeButton} accessibilityRole="button" accessibilityLabel={show ? 'Скрыть пароль' : 'Показать пароль'}>
        {show ? <EyeOff size={20} color="rgba(255,255,255,.54)" /> : <Eye size={20} color="rgba(255,255,255,.54)" />}
      </Pressable>
    </Field>
  );
}

function Field({ label, icon, children }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        {icon}
        {children}
      </View>
    </View>
  );
}

function SocialButton({ label, color }) {
  return (
    <Pressable style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.socialText, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bg },
  keyboard: { flex: 1 },
  glowLayer: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.95 },
  glowCyan: { left: -150, top: -170, width: 420, height: 420, backgroundColor: 'rgba(34,211,238,0.16)' },
  glowPink: { right: -190, bottom: -150, width: 520, height: 520, backgroundColor: 'rgba(242,45,143,0.18)' },
  glowBlue: { left: '30%', top: '30%', width: 360, height: 360, backgroundColor: 'rgba(47,123,255,0.10)' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: palette.cardLine,
    backgroundColor: palette.card,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 9,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.cardLine,
    backgroundColor: 'rgba(0,0,0,0.22)',
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tab: {
    flex: 1,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: palette.active,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tabPressed: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tabText: { color: 'rgba(255,255,255,0.52)', fontSize: 14, fontWeight: '800' },
  tabTextActive: { color: palette.activeText },
  form: { gap: 16 },
  fieldsWrap: { minHeight: 292, gap: 14 },
  fieldBlock: { gap: 8 },
  label: { color: palette.textSoft, fontSize: 14, fontWeight: '700' },
  inputRow: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.cardLine,
    backgroundColor: palette.field,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    color: palette.text,
    fontSize: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: palette.error, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  submit: {
    height: 54,
    borderRadius: 18,
    backgroundColor: palette.active,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  submitPressed: { transform: [{ translateY: -1 }], opacity: 0.92 },
  submitDisabled: { opacity: 0.45 },
  submitText: { color: palette.activeText, fontSize: 16, fontWeight: '900' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  dividerText: { color: palette.textFaint, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', fontWeight: '800' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.cardLine,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonPressed: { backgroundColor: 'rgba(255,255,255,0.12)', transform: [{ translateY: -1 }] },
  socialText: { fontSize: 22, fontWeight: '900' },
  terms: {
    maxWidth: 340,
    marginTop: 20,
    paddingHorizontal: 4,
    color: palette.textFaint,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
});
