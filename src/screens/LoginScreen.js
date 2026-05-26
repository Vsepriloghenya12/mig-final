import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Eye, EyeOff, Lock, Phone, Send, UserRound } from 'lucide-react-native';
import { assets } from '../assets';
import { useTheme } from '../theme-context';
import { Text } from '../components/ui/text';

function isPhoneValid(phone) {
  return String(phone || '').replace(/[^0-9]/g, '').length >= 10;
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
  const raw = String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 28);
  return raw ? `@${raw}` : '';
}

export function LoginScreen({ onSave }) {
  const { isDark } = useTheme();
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

  const palette = isDark ? darkPalette : lightPalette;

  const handleSubmit = async () => {
    setError('');
    if (!canSubmit) {
      setError(mode === 'login' ? 'Введите телефон и пароль.' : 'Заполните все поля регистрации.');
      return;
    }
    setBusy(true);
    try {
      await onSave({
        mode,
        phone,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        handle: normalizeHandle(nickname),
      });
    } catch (e) {
      setError(e?.message || (mode === 'login' ? 'Не удалось войти' : 'Не удалось создать аккаунт'));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.bg }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <View style={[styles.glowTop, { backgroundColor: palette.glowCyan }]} />
          <View style={[styles.glowBottom, { backgroundColor: palette.glowPink }]} />
          <View style={[styles.glowCenter, { backgroundColor: palette.glowBlue }]} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top + 22, 36), paddingBottom: insets.bottom + 30 }]}
        >
          <View style={styles.logoBlock}>
            <Text style={[styles.welcome, { color: palette.text }]}>Добро пожаловать в</Text>
            <Image source={assets.fullLogo} resizeMode="contain" style={styles.logo} />
          </View>

          <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder, shadowColor: palette.shadow }]}> 
            <View style={[styles.tabs, { backgroundColor: palette.tabsBg, borderColor: palette.border }]}> 
              <TabButton title="Войти" active={mode === 'login'} palette={palette} onPress={() => switchMode('login')} />
              <TabButton title="Зарегистрироваться" active={mode === 'register'} palette={palette} onPress={() => switchMode('register')} />
            </View>

            <View style={styles.form}> 
              {mode === 'login' ? (
                <>
                  <PhoneField value={phone} onChange={setPhone} palette={palette} />
                  <PasswordField value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} palette={palette} />
                </>
              ) : (
                <>
                  <PhoneField value={phone} onChange={setPhone} palette={palette} />
                  <Field label="Имя" icon={<UserRound size={21} color={palette.icon} strokeWidth={2.2} />} palette={palette}>
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      placeholder="Введите имя"
                      placeholderTextColor={palette.placeholder}
                      style={[styles.input, { color: palette.text }]}
                      returnKeyType="next"
                    />
                  </Field>
                  <Field label="Фамилия" icon={<UserRound size={21} color={palette.icon} strokeWidth={2.2} />} palette={palette}>
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      placeholder="Введите фамилию"
                      placeholderTextColor={palette.placeholder}
                      style={[styles.input, { color: palette.text }]}
                      returnKeyType="next"
                    />
                  </Field>
                  <Field label="Никнейм" icon={<UserRound size={21} color={palette.icon} strokeWidth={2.2} />} palette={palette}>
                    <TextInput
                      value={nickname}
                      onChangeText={setNickname}
                      placeholder="Введите никнейм"
                      placeholderTextColor={palette.placeholder}
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.input, { color: palette.text }]}
                      returnKeyType="next"
                    />
                  </Field>
                  <PasswordField value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword((value) => !value)} palette={palette} placeholder="Минимум 6 символов" />
                </>
              )}
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit || busy}
              style={({ pressed }) => [
                styles.submit,
                { backgroundColor: palette.submit, opacity: !canSubmit || busy ? 0.45 : pressed ? 0.86 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
            >
              <Text style={[styles.submitText, { color: palette.submitText }]}>{busy ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</Text>
              <ArrowRight size={21} color={palette.submitText} strokeWidth={2.6} />
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <Text style={[styles.or, { color: palette.dim }]}>или</Text>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
            </View>

            <View style={styles.socialGrid}>
              <SocialButton label="Google" palette={palette}><Text style={styles.google}>G</Text></SocialButton>
              <SocialButton label="Яндекс" palette={palette}><Text style={styles.yandex}>Я</Text></SocialButton>
              <SocialButton label="Telegram" palette={palette}><Send size={26} color="#27A7E7" fill="#27A7E7" strokeWidth={1.8} /></SocialButton>
              <SocialButton label="Apple ID" palette={palette}><Text style={[styles.apple, { color: palette.text }]}></Text></SocialButton>
            </View>
          </View>

          <Text style={[styles.terms, { color: palette.dim }]}>Продолжая, вы соглашаетесь с условиями сервиса и политикой конфиденциальности.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function TabButton({ title, active, palette, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tab, active ? { backgroundColor: palette.activeTab } : null, pressed && !active ? { backgroundColor: palette.tabPressed } : null]} accessibilityRole="button">
      <Text style={[styles.tabText, { color: active ? palette.activeTabText : palette.inactiveTabText }]}>{title}</Text>
    </Pressable>
  );
}

function PhoneField({ value, onChange, palette }) {
  return (
    <Field label="Номер телефона" icon={<Phone size={21} color={palette.icon} strokeWidth={2.2} />} palette={palette}>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="phone-pad"
        inputMode="tel"
        placeholder="+7 999 000-00-00"
        placeholderTextColor={palette.placeholder}
        style={[styles.input, { color: palette.text }]}
        returnKeyType="next"
      />
    </Field>
  );
}

function PasswordField({ value, onChange, show, onToggle, palette, placeholder = 'Введите пароль' }) {
  return (
    <Field label="Пароль" icon={<Lock size={21} color={palette.icon} strokeWidth={2.2} />} palette={palette}>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={!show}
        placeholder={placeholder}
        placeholderTextColor={palette.placeholder}
        style={[styles.input, { color: palette.text }]}
        returnKeyType="done"
      />
      <Pressable onPress={onToggle} hitSlop={10} style={({ pressed }) => [styles.eye, pressed ? { backgroundColor: palette.tabPressed } : null]} accessibilityRole="button" accessibilityLabel={show ? 'Скрыть пароль' : 'Показать пароль'}>
        {show ? <EyeOff size={21} color={palette.eye} strokeWidth={2.2} /> : <Eye size={21} color={palette.eye} strokeWidth={2.2} />}
      </Pressable>
    </Field>
  );
}

function Field({ label, icon, palette, children }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.label, { color: palette.label }]}>{label}</Text>
      <View style={[styles.inputBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}> 
        {icon}
        {children}
      </View>
    </View>
  );
}

function SocialButton({ label, palette, children }) {
  return (
    <Pressable onPress={() => Alert.alert(label, 'Скоро будет доступно')} style={({ pressed }) => [styles.social, { backgroundColor: palette.socialBg, borderColor: palette.border }, pressed ? { backgroundColor: palette.tabPressed } : null]} accessibilityRole="button" accessibilityLabel={label}>
      {children}
    </Pressable>
  );
}

const darkPalette = {
  bg: '#090B16',
  card: 'rgba(255,255,255,0.075)',
  cardBorder: 'rgba(255,255,255,0.12)',
  shadow: '#000000',
  text: '#F9FAFF',
  label: 'rgba(249,250,255,0.68)',
  dim: 'rgba(249,250,255,0.38)',
  border: 'rgba(255,255,255,0.12)',
  tabsBg: 'rgba(0,0,0,0.24)',
  activeTab: '#FFFFFF',
  activeTabText: '#111827',
  inactiveTabText: 'rgba(249,250,255,0.56)',
  tabPressed: 'rgba(255,255,255,0.10)',
  inputBg: 'rgba(0,0,0,0.22)',
  placeholder: 'rgba(249,250,255,0.30)',
  icon: 'rgba(249,250,255,0.38)',
  eye: 'rgba(249,250,255,0.52)',
  submit: '#FFFFFF',
  submitText: '#111827',
  socialBg: 'rgba(255,255,255,0.065)',
  glowCyan: 'rgba(34,211,238,0.18)',
  glowPink: 'rgba(242,45,143,0.22)',
  glowBlue: 'rgba(47,123,255,0.12)',
};

const lightPalette = {
  bg: '#F6F3FB',
  card: 'rgba(255,255,255,0.84)',
  cardBorder: 'rgba(96,72,135,0.14)',
  shadow: '#3C236E',
  text: '#151326',
  label: 'rgba(21,19,38,0.66)',
  dim: 'rgba(21,19,38,0.42)',
  border: 'rgba(80,57,120,0.12)',
  tabsBg: 'rgba(80,57,120,0.06)',
  activeTab: '#151326',
  activeTabText: '#FFFFFF',
  inactiveTabText: 'rgba(21,19,38,0.56)',
  tabPressed: 'rgba(242,45,143,0.08)',
  inputBg: 'rgba(255,255,255,0.72)',
  placeholder: 'rgba(21,19,38,0.32)',
  icon: 'rgba(21,19,38,0.38)',
  eye: 'rgba(21,19,38,0.54)',
  submit: '#151326',
  submitText: '#FFFFFF',
  socialBg: 'rgba(255,255,255,0.62)',
  glowCyan: 'rgba(34,211,238,0.14)',
  glowPink: 'rgba(242,45,143,0.14)',
  glowBlue: 'rgba(47,123,255,0.09)',
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    minHeight: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowTop: {
    position: 'absolute',
    left: -96,
    top: -130,
    width: 420,
    height: 420,
    borderRadius: 210,
    opacity: 1,
  },
  glowBottom: {
    position: 'absolute',
    right: -140,
    bottom: -118,
    width: 520,
    height: 520,
    borderRadius: 260,
  },
  glowCenter: {
    position: 'absolute',
    left: '18%',
    top: '30%',
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  welcome: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 235,
    height: 78,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 32,
    padding: 20,
    shadowOpacity: 0.33,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  tabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '900',
  },
  form: {
    gap: 16,
  },
  fieldWrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  inputBox: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 0,
  },
  eye: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submit: {
    marginTop: 18,
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '900',
  },
  dividerRow: {
    marginVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  or: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  social: {
    flex: 1,
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  google: {
    fontSize: 25,
    fontWeight: '900',
    color: '#4285F4',
  },
  yandex: {
    fontSize: 25,
    fontWeight: '900',
    color: '#FC3F1D',
  },
  apple: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 3,
  },
  terms: {
    maxWidth: 350,
    marginTop: 18,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  error: {
    color: '#FF6B8A',
    marginTop: 14,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
});
