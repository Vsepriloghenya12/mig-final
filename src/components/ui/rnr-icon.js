import React from 'react';
import { cssInterop } from 'nativewind';

const interopIcons = new WeakSet();

export function iconWithClassName(icon) {
  if (!icon || interopIcons.has(icon)) return;
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true
      }
    }
  });
  interopIcons.add(icon);
}

export function Icon({ as: IconComponent, size = 20, color, className, ...props }) {
  iconWithClassName(IconComponent);
  return <IconComponent size={size} color={color} className={className} {...props} />;
}
