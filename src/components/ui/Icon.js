import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../theme';

const glyphs = {
  home: '⌂', video: '▷', plus: '+', near: '⌖', profile: '○', heart: '♡',
  heartOn: '♥', comment: '◌', share: '↗', mail: '✉', save: '◇', more: '•••',
  search: '⌕', back: '‹', close: '×', send: '➤', image: '▧', game: '✦', check: '✓'
};

export function Icon({ name, size = 24, active, color }) {
  return (
    <Text style={{ fontSize: size, lineHeight: size + 4, color: color || (active ? colors.hot : colors.text), fontWeight: '800' }}>
      {glyphs[name] || name}
    </Text>
  );
}

export function MailIcon() {
  return (
    <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 23, height: 17, borderRadius: 6, borderWidth: 2, borderColor: colors.ink }}>
        <View style={{ position: 'absolute', left: 3, right: 3, top: 2, height: 11, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: colors.hot, transform: [{ rotate: '-45deg' }] }} />
      </View>
    </View>
  );
}
