import React from 'react';
import { Text as RNText } from 'react-native';
import { cn } from '@/src/lib/utils';
import { useTheme } from '../../theme-context';

export const TextClassContext = React.createContext('');

export const Text = React.forwardRef(function Text({ className, style, ...props }, ref) {
  const textClassName = React.useContext(TextClassContext);
  const { isDark, palette } = useTheme();
  return (
    <RNText
      ref={ref}
      className={cn('text-base text-foreground', textClassName, className)}
      style={[isDark && { color: palette.ink }, style]}
      {...props}
    />
  );
});
