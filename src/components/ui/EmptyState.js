import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, softShadow } from '../../theme';

export function EmptyState({ title, text, action, onPress }) {
  return (
    <View style={{ paddingVertical: 48, paddingHorizontal: 28, alignItems: 'center' }}>
      <Text style={{ color: colors.ink, fontWeight: '900', fontSize: 21, textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 }}>{text}</Text> : null}
      {action ? <Pressable onPress={onPress} style={{ marginTop: 18, backgroundColor: colors.hot, borderRadius: 24, paddingHorizontal: 22, paddingVertical: 13, ...softShadow }}><Text style={{ color: colors.white, fontWeight: '900' }}>{action}</Text></Pressable> : null}
    </View>
  );
}
