import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors, softShadow } from '../../theme';

export function TextField({ label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={{ color: colors.muted, fontWeight: '900', marginBottom: 7 }}>{label}</Text> : null}
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline}
        placeholderTextColor={colors.muted}
        style={{ minHeight: multiline ? 86 : 50, borderWidth: 1, borderColor: colors.line, borderRadius: 22, paddingHorizontal: 17, paddingVertical: 13, color: colors.ink, backgroundColor: colors.white, ...softShadow }}
      />
    </View>
  );
}
