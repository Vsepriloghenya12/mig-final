import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { buttonShadow, cardShadow, colors } from '../../theme';

export function EmptyState({ title, text, action, onPress }) {
  return (
    <View style={{ marginHorizontal: 16, marginTop: 18, paddingVertical: 34, paddingHorizontal: 24, borderRadius: 30, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', ...cardShadow }}>
      <View style={{ width: 46, height: 46, borderRadius: 18, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <Text style={{ color: colors.hot, fontWeight: '900', fontSize: 24, lineHeight: 28 }}>+</Text>
      </View>
      <Text style={{ color: colors.ink, fontWeight: '900', fontSize: 21, lineHeight: 26, textAlign: 'center' }}>{title}</Text>
      {text ? <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 }}>{text}</Text> : null}
      {action ? <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={onPress} style={{ marginTop: 20, backgroundColor: colors.hot, borderRadius: 24, paddingHorizontal: 22, paddingVertical: 13, ...buttonShadow }}><Text style={{ color: colors.white, fontWeight: '900' }}>{action}</Text></Pressable> : null}
    </View>
  );
}
