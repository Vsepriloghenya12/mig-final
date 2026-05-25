import React from 'react';
import { View } from 'react-native';
import { cn } from '@/src/lib/utils';
import { Text } from './text';
import { useTheme } from '../../theme-context';

export const Card = React.forwardRef(function Card({ className, style, ...props }, ref) {
  const { isDark, palette } = useTheme();
  return <View ref={ref} className={cn('rounded-3xl border border-border bg-card p-4', className)} style={[isDark && { backgroundColor: palette.surface, borderColor: palette.line }, style]} {...props} />;
});

export const CardHeader = React.forwardRef(function CardHeader({ className, ...props }, ref) {
  return <View ref={ref} className={cn('gap-1.5 pb-3', className)} {...props} />;
});

export const CardTitle = React.forwardRef(function CardTitle({ className, ...props }, ref) {
  return <Text ref={ref} className={cn('text-xl font-black text-card-foreground', className)} {...props} />;
});

export const CardDescription = React.forwardRef(function CardDescription({ className, ...props }, ref) {
  return <Text ref={ref} className={cn('text-sm leading-5 text-muted-foreground', className)} {...props} />;
});

export const CardContent = React.forwardRef(function CardContent({ className, ...props }, ref) {
  return <View ref={ref} className={cn('gap-3', className)} {...props} />;
});

export const CardFooter = React.forwardRef(function CardFooter({ className, ...props }, ref) {
  return <View ref={ref} className={cn('flex-row items-center gap-2 pt-3', className)} {...props} />;
});
