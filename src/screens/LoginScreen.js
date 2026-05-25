import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { assets } from '../assets';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Text } from '../components/ui/text';
import { useTheme } from '../theme-context';
import { colors } from '../theme';

function cleanPhone(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

export function LoginScreen({ onSave }) {
  const { palette } = useTheme();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const canLogin = name.trim().length >= 2 && cleanPhone(phone).length >= 6;

  return <View style={[styles.wrap, { backgroundColor: palette.bg }]}> 
    <View style={styles.blobA} /><View style={styles.blobB} />
    <Image source={assets.fullLogo} style={[styles.logo, { width: 220 }]} resizeMode="contain" />
    <Card className="mx-6 rounded-[30px] border-border bg-card/95 p-0">
      <CardHeader className="items-center px-6 pt-7">
        <CardTitle className="text-center text-3xl">Вход</CardTitle>
        <CardDescription className="text-center leading-5">Введите номер телефона и имя. Больше ничего не нужно.</CardDescription>
      </CardHeader>
      <CardContent className="gap-3 px-6 pb-6">
        <Input
          value={phone}
          onChangeText={setPhone}
          placeholder="Номер телефона"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          accessibilityLabel="Номер телефона"
        />
        <Input
          value={name}
          onChangeText={setName}
          placeholder="Имя"
          textContentType="name"
          autoComplete="name"
          accessibilityLabel="Имя профиля"
        />
        <Button onPress={() => onSave({ name, phone })} disabled={!canLogin} accessibilityLabel="Войти в приложение">
          <Text>Войти</Text>
        </Button>
        <Text style={styles.hint}>По номеру приложение найдёт ваш профиль при следующем входе.</Text>
      </CardContent>
    </Card>
  </View>;
}
const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center' },
  blobA: { position: 'absolute', width: 220, height: 220, borderRadius: 110, left: -80, top: 90, backgroundColor: 'rgba(242,45,143,.10)' },
  blobB: { position: 'absolute', width: 250, height: 250, borderRadius: 125, right: -100, bottom: 105, backgroundColor: 'rgba(47,123,255,.08)' },
  logo: { width: 250, height: 112, alignSelf: 'center', marginBottom: 24 },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 2 }
});
