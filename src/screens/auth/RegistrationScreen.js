import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  Animated,
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
import { assets } from '../../assets';
import { colors } from '../../theme';
import { Text } from '../../components/ui/text';

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

function cleanHandle(value) {
  const raw = String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 28);
  return raw ? `@${raw}` : '';
}

export function RegistrationScreen({ onSave }) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+7 ');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      damping: 18,
      stiffness: 120,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [cardAnim]);

  const canSubmit = useMemo(() => {
    if (mode === 'login') return isLoginValid({ phone, password });
    return isRegisterValid({ phone, firstName, lastName, nickname, password });
  }, [mode, phone, password, firstName, lastName, nickname]);

  const handleSubmit = async () => {
    setError('');
    if (!canSubmit || busy) return;
    setBusy(true);
    try {
      await onSave({
        mode,
        phone,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        nickname: nickname.trim(),
        handle: cleanHandle(nickname),
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
          contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 20, 36), paddingBottom: insets.bottom + 28 }]}
        >
          <View style={styles.logoBlock}>
            <Text style={styles.welcome}>Добро пожаловать в</Text>
            <Image source={assets.fullLogo} resizeMode="contain" style={styles.logo} />
          </View>

          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardAnim,
                transform: [
                  { translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                  { scale: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
                ],
              },
            ]}
          >
            <View style={styles.tabs}>
              <TabButton label="Войти" active={mode === 'login'} onPress={() => switchMode('login')} />
              <TabButton label="Зарегистрироваться" active={mode === 'register'} onPress={() => switchMode('register')} />
            </View>

            <View style={styles.form}>
              <View style={styles.fieldsArea}>
                <PhoneField value={phone} onChange={setPhone} />

                {mode === 'register' ? (
                  <>
                    <Field label="Имя" icon={<UserRound size={20} color={rgba.white35} />}>
                      <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="Введите имя"
                        placeholderTextColor={rgba.white25}
                        style={styles.input}
                        returnKeyType="next"
                      />
                    </Field>

                    <Field label="Фамилия" icon={<UserRound size={20} color={rgba.white35} />}>
                      <TextInput
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Введите фамилию"
                        placeholderTextColor={rgba.white25}
                        style={styles.input}
                        returnKeyType="next"
                      />
                    </Field>

                    <Field label="Никнейм" icon={<UserRound size={20} color={rgba.white35} />}>
                      <TextInput
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="Введите никнейм"
                        placeholderTextColor={rgba.white25}
                        style={styles.input}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="next"
                      />
                    </Field>
                  </>
                ) : null}

                <PasswordField value={password} onChange={setPassword} show={showPassword} setShow={setShowPassword} mode={mode} onSubmit={handleSubmit} />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit || busy}
                style={({ pressed }) => [
                  styles.submit,
                  (!canSubmit || busy) && styles.submitDisabled,
                  pressed && canSubmit && !busy ? styles.submitPressed : null,
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit || busy }}
              >
                <Text style={styles.submitText}>{busy ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}</Text>
                <ArrowRight size={20} color="#121524" />
              </Pressable>
            </View>

            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>или</Text>
              <View style={styles.separatorLine} />
            </View>

            <View style={styles.socialGrid}>
              <SocialButton label="Google" value="G" color="#FFFFFF" textColor="#4285F4" />
              <SocialButton label="Яндекс" value="Я" color="#FFFFFF" textColor="#FC3F1D" />
              <SocialButton label="Telegram" value="✈" color="#FFFFFF" textColor="#26A5E4" />
              <SocialButton label="Apple ID" value="" color="#FFFFFF" textColor="#FFFFFF" />
            </View>
          </Animated.View>

          <Text style={styles.terms}>Продолжая, вы соглашаетесь с условиями сервиса и политикой конфиденциальности.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PhoneField({ value, onChange }) {
  return (
    <Field label="Номер телефона" icon={<Phone size={20} color={rgba.white35} />}>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="phone-pad"
        inputMode="tel"
        placeholder="+7 999 000-00-00"
        placeholderTextColor={rgba.white25}
        style={styles.input}
        returnKeyType="next"
      />
    </Field>
  );
}

function PasswordField({ value, onChange, show, setShow, mode, onSubmit }) {
  return (
    <Field label="Пароль" icon={<Lock size={20} color={rgba.white35} />}>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={!show}
        placeholder={mode === 'login' ? 'Введите пароль' : 'Минимум 6 символов'}
        placeholderTextColor={rgba.white25}
        style={styles.input}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
      />
      <Pressable onPress={() => setShow((current) => !current)} style={styles.eyeButton} accessibilityRole="button" accessibilityLabel={show ? 'Скрыть пароль' : 'Показать пароль'}>
        {show ? <EyeOff size={20} color={rgba.white55} /> : <Eye size={20} color={rgba.white55} />}
      </Pressable>
    </Field>
  );
}

function Field({ label, icon, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        {icon}
        {children}
      </View>
    </View>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && !active ? styles.tabPressed : null]} accessibilityRole="tab" accessibilityState={{ selected: active }}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SocialButton({ label, value, textColor }) {
  const onPress = () => Alert.alert(label, 'Социальный вход будет подключён позже');
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.social, pressed && styles.socialPressed]} accessibilityRole="button" accessibilityLabel={label}>
      <Text style={[styles.socialText, { color: textColor }]}>{value}</Text>
    </Pressable>
  );
}

const rgba = {
  white10: 'rgba(255,255,255,0.10)',
  white12: 'rgba(255,255,255,0.12)',
  white25: 'rgba(255,255,255,0.25)',
  white35: 'rgba(255,255,255,0.35)',
  white55: 'rgba(255,255,255,0.55)',
  white65: 'rgba(255,255,255,0.65)',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#090B18',
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
    borderRadius: 260,
    opacity: 0.9,
  },
  glowCyan: {
    left: -125,
    top: -130,
    width: 420,
    height: 420,
    backgroundColor: 'rgba(47, 205, 255, 0.16)',
  },
  glowPink: {
    right: -145,
    bottom: -145,
    width: 520,
    height: 520,
    backgroundColor: 'rgba(242, 45, 143, 0.20)',
  },
  glowBlue: {
    left: '18%',
    top: '33%',
    width: 360,
    height: 360,
    backgroundColor: 'rgba(47, 123, 255, 0.12)',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 22,
  },
  welcome: {
    color: '#FFFFFF',
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: -0.35,
    textAlign: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 220,
    height: 76,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: rgba.white10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.42,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 14,
  },
  tabs: {
    marginBottom: 20,
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: rgba.white10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    padding: 4,
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  tabPressed: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabText: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 14,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#121524',
  },
  form: {
    gap: 4,
  },
  fieldsArea: {
    minHeight: 262,
    gap: 14,
  },
  field: {
    gap: 8,
  },
  label: {
    color: rgba.white65,
    fontSize: 14,
    fontWeight: '800',
  },
  inputWrap: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: rgba.white10,
    backgroundColor: 'rgba(0,0,0,0.24)',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 0,
  },
  eyeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: '#FF8EAD',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 10,
  },
  submit: {
    marginTop: 16,
    height: 54,
    width: '100%',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  submitPressed: {
    transform: [{ translateY: 1 }],
    opacity: 0.92,
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitText: {
    color: '#121524',
    fontSize: 16,
    fontWeight: '900',
  },
  separator: {
    marginVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: rgba.white10,
  },
  separatorText: {
    color: rgba.white35,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  socialGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  social: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: rgba.white10,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  socialPressed: {
    backgroundColor: rgba.white12,
    transform: [{ translateY: 1 }],
  },
  socialText: {
    fontSize: 25,
    fontWeight: '900',
  },
  terms: {
    marginTop: 18,
    paddingHorizontal: 12,
    color: rgba.white35,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
});
