import React from 'react';
import { View } from 'react-native';
import { cva } from 'class-variance-authority';
import { cn } from '@/src/lib/utils';
import { TextClassContext, Text } from './text';

const badgeVariants = cva('self-start rounded-full px-3 py-1', {
  variants: {
    variant: {
      default: 'bg-primary',
      secondary: 'bg-secondary',
      outline: 'border border-border bg-transparent',
      destructive: 'bg-destructive'
    }
  },
  defaultVariants: { variant: 'default' }
});

const badgeTextVariants = cva('text-xs font-black', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      outline: 'text-foreground',
      destructive: 'text-destructive-foreground'
    }
  },
  defaultVariants: { variant: 'default' }
});

export { badgeVariants, badgeTextVariants };

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <TextClassContext.Provider value={badgeTextVariants({ variant })}>
      <View className={cn(badgeVariants({ variant }), className)} {...props}>
        {typeof children === 'string' || typeof children === 'number' ? <Text>{children}</Text> : children}
      </View>
    </TextClassContext.Provider>
  );
}
