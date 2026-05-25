import React from 'react';
import { TextInput } from 'react-native';
import { cn } from '@/src/lib/utils';
import { useTheme } from '../../theme-context';

const baseInput = 'min-h-12 rounded-2xl border border-input bg-card px-4 py-3 text-base font-semibold text-foreground placeholder:text-muted-foreground';

export const Input = React.forwardRef(function Input({ className, editable = true, style, ...props }, ref) {
  const { palette, isDark } = useTheme();
  return (
    <TextInput
      ref={ref}
      editable={editable}
      className={cn(baseInput, !editable && 'opacity-60', className)}
      placeholderTextColor={palette.muted}
      style={[isDark && { color: palette.ink, backgroundColor: palette.input, borderColor: palette.line }, style]}
      {...props}
    />
  );
});

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return <Input ref={ref} multiline textAlignVertical="top" className={cn('min-h-24 leading-5', className)} {...props} />;
});
