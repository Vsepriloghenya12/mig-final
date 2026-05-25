import React from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';
import { TextClassContext } from './text';
import { useTheme } from '../../theme-context';

const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 rounded-full active:opacity-80 disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        outline: 'border border-border bg-card',
        ghost: 'bg-transparent',
        destructive: 'bg-destructive'
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-10 px-4',
        lg: 'h-14 px-6',
        icon: 'h-11 w-11 px-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

const buttonTextVariants = cva('text-sm font-black', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
      destructive: 'text-destructive-foreground'
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
      icon: 'text-sm'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
});

export { buttonVariants, buttonTextVariants };

export const Button = React.forwardRef(function Button(
  { className, variant = 'default', size = 'default', loading = false, disabled, children, ...props },
  ref
) {
  const isDisabled = disabled || loading;
  const { isDark, palette } = useTheme();
  const darkStyle = isDark && (variant === 'outline' || variant === 'secondary') ? { backgroundColor: palette.surface, borderColor: palette.line } : null;
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        style={darkStyle}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled }}
        {...props}
      >
        {loading ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#15142D' : '#FFFFFF'} /> : children}
      </Pressable>
    </TextClassContext.Provider>
  );
});
