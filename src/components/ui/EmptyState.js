import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../theme';

export function EmptyState({ title, text, action, onPress }) {
  return (
    <View style={{ paddingVertical: 46, paddingHorizontal: 24, alignItems: 'center' }}>
      <Text style={{ color: colors.ink, fontWeight: '900', fontSize: 20, textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 }}>{text}</Text> : null}
      {action ? <Pressable onPress={onPress} style={{ marginTop: 18, backgroundColor: colors.hot, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 12 }}><Text style={{ color: colors.white, fontWeight: '900' }}>{action}</Text></Pressable> : null}
    </View>
  );
}
