import React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { Input, Textarea } from './input';

export function TextField({ label, value, onChangeText, placeholder, multiline, accessibilityLabel }) {
  const Field = multiline ? Textarea : Input;
  return (
    <View className="mb-4 gap-2">
      {label ? <Text className="px-1 text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</Text> : null}
      <Field
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel || label || placeholder}
      />
    </View>
  );
}
