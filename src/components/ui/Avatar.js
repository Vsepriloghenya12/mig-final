import React from 'react';
import { Image, Text, View } from 'react-native';
import { colors } from '../../theme';
import { useTheme } from '../../theme-context';
import { initials, mediaSource } from '../../utils/media';

export function Avatar({ user, size = 42, ringColor }) {
  const { palette } = useTheme();
  const source = mediaSource(user);
  const border = ringColor ? { borderWidth: 3, borderColor: ringColor, padding: 2 } : null;
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: palette.faint }, border]}>
      {source ? <Image source={source} style={{ width: '100%', height: '100%' }} /> : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: palette.ink, fontWeight: '900' }}>{initials(user?.name)}</Text>
        </View>
      )}
    </View>
  );
}
