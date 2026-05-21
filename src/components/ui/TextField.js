import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors } from '../../theme';

export function TextField({ label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={{ color: colors.muted, fontWeight: '800', marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline}
        placeholderTextColor={colors.muted}
        style={{ minHeight: multiline ? 84 : 48, borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 12, color: colors.ink, backgroundColor: colors.white }}
      />
    </View>
  );
}
