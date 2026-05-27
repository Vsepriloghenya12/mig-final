import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Eye, EyeOff, Lock, Phone, UserRound } from 'lucide-react-native';
import { assets } from '../../assets';
import { colors } from '../../theme';
import { useTheme } from '../../theme-context';

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
  const clean = String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 28);
  return clean ? `@${clean}` : '';
}

export function RegistrationScreen({ onSave }) {
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useTheme();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+7 ');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => {
    if (mode === 'login') return isLoginValid({ phone, password });
    return isRegisterValid({ phone, firstName, lastName, nickname, password });
  }, [mode, phone, password, firstName, lastName, nickname]);

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!canSubmit || busy) {
      setError(mode === 'login' ? 'Введите телефон и пароль.' : 'Заполните все поля.');
      return;
    }

    setBusy(true);
    try {
      const first = firstName.trim();
      const last = lastName.trim();
      const handle = normalizeHandle(nickname);
      await onSave({
        mode,
        phone,
        password,
        firstName: first,
        lastName: last,
        nickname: handle,
        handle,
        name: mode === 'register' ? `${first} ${last}`.trim() : '',
      });
    } catch (e) {
      setError(e?.message || (mode === 'login' ? 'Не удалось войти.' : 'Не удалось создать аккаунт.'));
    } finally {
      setBusy(false);
    }
  };

  const textColor = isDark ? '#FFFFFF' : colors.ink;
  const mutedColor = isDark ? 'rgba(255,255,255,0.62)' : colors.muted;
  const cardBg = isDark ? '#12172A' : '#FFFCFF';
  const panelBg = isDark ? '#0D1122' : '#F5EEFF';
  const inputBg = isDark ? '#0B1020' : '#FFFFFF';
  const lineColor = isDark ? 'rgba(255,255,255,0.12)' : '#E8DFF4';
  const iconColor = isDark ? 'rgba(255,255,255,0.44)' : 'rgba(21,20,45,0.42)';
  const placeholderColor = isDark ? 'rgba(255,255,255,0.30)' : 'rgba(21,20,45,0.32)';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.bg }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <View pointerEvents="none" style={styles.glowLayer}>
          <View style={[styles.glow, styles.glowTop]} />
          <View style={[styles.glow, styles.glowBottom]} />
          <View style={[styles.glow, styles.glowCenter]} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 26, paddingBottom: insets.bottom + 26 }]}
        >
          <View style={styles.logoBlock}>
            <Image source={assets.fullLogo} resizeMode="contain" style={styles.logo} />
          </View>

          <View style={[styles.card, { backgroundColor: cardBg, borderColor: lineColor }]}> 
            <View style={[styles.tabs, { backgroundColor: panelBg, borderColor: lineColor }]}> 
              <TabButton label="Войти" active={mode === 'login'} onPress={() => switchMode('login')} />
              <TabButton label="Зарегистрироваться" active={mode === 'register'} onPress={() => switchMode('register')} />
            </View>

            <View style={styles.form}>
              <View style={styles.fieldsWrap}>
                <PhoneField value={phone} onChange={setPhone} iconColor={iconColor} textColor={textColor} mutedColor={mutedColor} placeholderColor={placeholderColor} inputBg={inputBg} lineColor={lineColor} />

                {mode === 'register' ? (
                  <>
                    <Field label="Имя" icon={<UserRound size={20} color={iconColor} strokeWidth={2.1} />} textColor={textColor} mutedColor={mutedColor} inputBg={inputBg} lineColor={lineColor}>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Введите имя"
                        placeholderTextColor={placeholderColor}
                        style={[styles.input, { color: textColor }]}
                        returnKeyType="next"
                      />
                    </Field>

                    <Field label="Фамилия" icon={<UserRound size={20} color={iconColor} strokeWidth={2.1} />} textColor={textColor} mutedColor={mutedColor} inputBg={inputBg} lineColor={lineColor}>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Введите фамилию"
                        placeholderTextColor={placeholderColor}
                        style={[styles.input, { color: textColor }]}
                        returnKeyType="next"
                      />
                    </Field>

                    <Field label="Никнейм" icon={<UserRound size={20} color={iconColor} strokeWidth={2.1} />} textColor={textColor} mutedColor={mutedColor} inputBg={inputBg} lineColor={lineColor}>
                      <TextInput
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Введите никнейм"
                        placeholderTextColor={placeholderColor}
                        style={[styles.input, { color: textColor }]}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                      />
                    </Field>
                  </>
                ) : null}

                <Field label="Пароль" icon={<Lock size={20} color={iconColor} strokeWidth={2.1} />} textColor={textColor} mutedColor={mutedColor} inputBg={inputBg} lineColor={lineColor}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={mode === 'login' ? 'Введите пароль' : 'Минимум 6 символов'}
                    placeholderTextColor={placeholderColor}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { color: textColor }]}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <Pressable
                    onPress={() => setShowPassword((value) => !value)}
                    style={styles.eyeButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {showPassword ? <EyeOff size={20} color={iconColor} /> : <Eye size={20} color={iconColor} />}
                  </Pressable>
                </Field>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                onPress={handleSubmit}
                disabled={busy}
                style={({ pressed }) => [
                  styles.submit,
                  busy && styles.submitDisabled,
                  pressed && !busy ? styles.submitPressed : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel={mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              >
                <Text style={styles.submitText}>{busy ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</Text>
              </Pressable>
            </View>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: lineColor }]} />
              <Text style={[styles.dividerText, { color: mutedColor }]}>или</Text>
              <View style={[styles.divider, { backgroundColor: lineColor }]} />
            </View>

            <View style={styles.socialGrid}>
              <SocialButton label="Google" text="G" textStyle={styles.googleText} lineColor={lineColor} inputBg={inputBg} />
              <SocialButton label="Яндекс" text="Я" textStyle={styles.yandexText} lineColor={lineColor} inputBg={inputBg} />
              <SocialButton label="Telegram" text="✈" textStyle={styles.telegramText} lineColor={lineColor} inputBg={inputBg} />
              <SocialButton label="Apple ID" text="" textStyle={[styles.appleText, { color: textColor }]} lineColor={lineColor} inputBg={inputBg} />
            </View>
          </View>

          <Text style={[styles.terms, { color: mutedColor }]}>Продолжая, вы соглашаетесь с условиями сервиса и политикой конфиденциальности.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PhoneField({ value, onChange, iconColor, textColor, mutedColor, placeholderColor, inputBg, lineColor }) {
  return (
    <Field label="Номер телефона" icon={<Phone size={20} color={iconColor} strokeWidth={2.1} />} textColor={textColor} mutedColor={mutedColor} inputBg={inputBg} lineColor={lineColor}>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="phone-pad"
        inputMode="tel"
        placeholder="+7 999 000-00-00"
        placeholderTextColor={placeholderColor}
        style={[styles.input, { color: textColor }]}
        returnKeyType="next"
      />
    </Field>
  );
}

function Field({ label, icon, children, mutedColor, inputBg, lineColor }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: mutedColor }]}>{label}</Text>
      <View style={[styles.inputShell, { backgroundColor: inputBg, borderColor: lineColor }]}> 
        {icon}
        {children}
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SocialButton({ label, text, textStyle, lineColor, inputBg }) {
  return (
    <Pressable style={[styles.socialButton, { borderColor: lineColor, backgroundColor: inputBg }]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.socialText, textStyle]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowTop: {
    left: -118,
    top: -102,
    width: 360,
    height: 360,
    backgroundColor: 'rgba(36, 203, 255, 0.14)',
  },
  glowBottom: {
    right: -138,
    bottom: -118,
    width: 420,
    height: 420,
    backgroundColor: 'rgba(242, 45, 143, 0.16)',
  },
  glowCenter: {
    left: '18%',
    top: '28%',
    width: 330,
    height: 330,
    backgroundColor: 'rgba(47, 123, 255, 0.10)',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 210,
    height: 82,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 32,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#1B143B',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  tabs: {
    height: 52,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#22164E',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  tabText: {
    color: 'rgba(125,120,144,0.88)',
    fontSize: 14,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#15142D',
  },
  form: {
    gap: 16,
  },
  fieldsWrap: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  inputShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 12,
  },
  eyeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  error: {
    color: '#FF5D8F',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  submit: {
    width: '100%',
    minHeight: 58,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F22D8F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    shadowColor: '#F22D8F',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  submitPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
  },
  submitDisabled: {
    opacity: 0.72,
  },
  submitText: {
    color: '#FFFFFF',
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
  dividerText: {
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontWeight: '900',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  socialText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  googleText: {
    color: '#2F7BFF',
  },
  yandexText: {
    color: '#FC3F1D',
  },
  telegramText: {
    color: '#26A5E4',
  },
  appleText: {
    fontSize: 25,
  },
  terms: {
    maxWidth: 360,
    marginTop: 18,
    paddingHorizontal: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
