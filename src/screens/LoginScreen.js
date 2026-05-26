import React, { useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { assets } from '../assets';
import { colors, shadow } from '../theme';
import { useTheme } from '../theme-context';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Text } from '../components/ui/text';

function cleanPhone(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

function cleanHandle(value) {
  const raw = String(value || '')
    .trim()
    .replace(/^@+/, '')
    .replace(/[^a-zA-Z0-9._]/g, '')
    .slice(0, 28);
  return raw ? `@${raw}` : '';
}

export function LoginScreen({ onSave }) {
  const { isDark, palette } = useTheme();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const phoneOk = cleanPhone(phone).length >= 6;
  const handleValue = useMemo(() => cleanHandle(handle), [handle]);

  const submit = async () => {
    setError('');
    if (!phoneOk) {
      setError('Введите номер телефона');
      return;
    }
    if (isRegister && name.trim().length < 2) {
      setError('Введите имя');
      return;
    }
    if (isRegister && handleValue.length < 3) {
      setError('Введите никнейм');
      return;
    }

    setBusy(true);
    try {
      await onSave({
        mode,
        phone: phone.trim(),
        name: isRegister ? name.trim() : '',
        handle: isRegister ? handleValue : '',
      });
    } catch (e) {
      setError(e?.message || (isRegister ? 'Не удалось зарегистрироваться' : 'Не удалось войти'));
    } finally {
      setBusy(false);
    }
  };

  const setTab = (next) => {
    setMode(next);
    setError('');
  };

  const bg = isDark ? '#000000' : '#F8F9FA';
  const cardBg = isDark ? '#0C0C12' : '#FFFFFF';
  const softBg = isDark ? '#181822' : '#F4F2FA';
  const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
  const mutedColor = isDark ? '#B8B3C8' : '#6C757D';
  const lineColor = isDark ? 'rgba(255,255,255,.14)' : '#E9ECEF';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
        <View style={[styles.blobTop, { backgroundColor: isDark ? 'rgba(242,45,143,0.13)' : 'rgba(242,45,143,0.09)' }]} />
        <View style={[styles.blobBottom, { backgroundColor: isDark ? 'rgba(47,123,255,0.16)' : 'rgba(47,123,255,0.10)' }]} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.inner, { paddingTop: Math.max(insets.top + 24, 42), paddingBottom: insets.bottom + 28 }]}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: textColor }]}>Добро пожаловать в</Text>
            <Image source={assets.fullLogo} resizeMode="contain" style={styles.logo} />
          </View>

          <Card className="w-full max-w-sm" style={[styles.card, { backgroundColor: cardBg, borderColor: lineColor }]}> 
            <CardHeader className="gap-4 pb-4">
              <View style={[styles.tabs, { backgroundColor: softBg, borderColor: lineColor }]}> 
                <Button
                  variant={mode === 'login' ? 'default' : 'ghost'}
                  className="flex-1 rounded-2xl"
                  size="sm"
                  onPress={() => setTab('login')}
                  style={mode === 'login' ? styles.activeTab : null}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Войти</Text>
                </Button>
                <Button
                  variant={mode === 'register' ? 'default' : 'ghost'}
                  className="flex-1 rounded-2xl"
                  size="sm"
                  onPress={() => setTab('register')}
                  style={mode === 'register' ? styles.activeTab : null}
                >
                  <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Регистрация</Text>
                </Button>
              </View>
            </CardHeader>

            <CardContent>
              <View className="w-full justify-center gap-4">
                <View className="gap-2">
                  <Text style={[styles.label, { color: mutedColor }]}>Телефон</Text>
                  <Input
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+7 999 000 00 00"
                    keyboardType="phone-pad"
                    returnKeyType={isRegister ? 'next' : 'done'}
                    onSubmitEditing={!isRegister ? submit : undefined}
                    style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor: lineColor }]}
                  />
                </View>

                {isRegister ? (
                  <>
                    <View className="gap-2">
                      <Text style={[styles.label, { color: mutedColor }]}>Имя</Text>
                      <Input
                        value={name}
                        onChangeText={setName}
                        placeholder="Ваше имя"
                        returnKeyType="next"
                        style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor: lineColor }]}
                      />
                    </View>
                    <View className="gap-2">
                      <Text style={[styles.label, { color: mutedColor }]}>Никнейм</Text>
                      <Input
                        value={handle}
                        onChangeText={setHandle}
                        placeholder="nickname"
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={submit}
                        style={[styles.input, { color: textColor, backgroundColor: cardBg, borderColor: lineColor }]}
                      />
                    </View>
                  </>
                ) : null}
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </CardContent>

            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full rounded-2xl"
                size="lg"
                loading={busy}
                onPress={submit}
                disabled={busy}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>{isRegister ? 'Зарегистрироваться' : 'Войти'}</Text>
              </Button>
            </CardFooter>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobTop: {
    position: 'absolute',
    left: -120,
    top: 82,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  blobBottom: {
    position: 'absolute',
    right: -122,
    bottom: 66,
    width: 286,
    height: 286,
    borderRadius: 143,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 238,
    height: 86,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 16,
    ...shadow,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 4,
    gap: 4,
  },
  activeTab: {
    backgroundColor: colors.blue,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6C757D',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900',
  },
  input: {
    minHeight: 54,
    borderRadius: 14,
    fontSize: 16,
    fontWeight: '800',
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  primaryButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: colors.blue,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
