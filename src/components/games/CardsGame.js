import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function CardsGame({ game, canMove, onMove }) {
  return <View style={styles.row}>{['A','K','Q'].map((key, i) => {
    const open = game.status === 'finished' && game.creatorChoice === String(i + 1);
    return <Pressable key={key} disabled={!canMove} onPress={() => onMove(String(i + 1))} style={[styles.card, open && styles.open]}>
      <Text style={[styles.text, open && styles.openText]}>{open ? key : '✦'}</Text>
    </Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingVertical: 10 },
  card: { width: 56, height: 78, borderRadius: 15, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  open: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.hot },
  text: { color: colors.white, fontSize: 24, fontWeight: '900' },
  openText: { color: colors.hot }
});
