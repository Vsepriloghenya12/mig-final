import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors, softShadow } from '../../theme';

export function TextField({ label, value, onChangeText, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 15 }}>
      {label ? <Text style={{ color: focused ? colors.hot : colors.muted, fontWeight: '900', marginBottom: 7, fontSize: 13 }}>{label}</Text> : null}
      <TextInput
        accessibilityLabel={label || placeholder}
        value={value} onChangeText={onChangeText} placeholder={placeholder} multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.muted}
        style={{ minHeight: multiline ? 96 : 52, borderWidth: 1, borderColor: focused ? colors.hot : colors.line, borderRadius: 22, paddingHorizontal: 17, paddingVertical: 13, color: colors.ink, backgroundColor: colors.white, fontWeight: '700', lineHeight: 20, ...softShadow }}
      />
    </View>
  );
}
