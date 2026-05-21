import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function CupsGame({ game, canMove, onMove }) {
  const done = game.status === 'finished';
  const labels = ['1', '2', '3'];
  return <View style={styles.row}>{labels.map((key) => <Pressable key={key} disabled={!canMove || done} onPress={() => onMove(key)} style={styles.cup}>
    <Text style={styles.cupText}>◖◗</Text>
    <Text style={styles.num}>{done && game.creatorChoice === key ? '●' : key}</Text>
  </Pressable>)}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingVertical: 10 },
  cup: { width: 64, height: 66, borderRadius: 22, backgroundColor: '#FFF1F8', alignItems: 'center', justifyContent: 'center' },
  cupText: { fontSize: 27, color: colors.hot, fontWeight: '900' },
  num: { color: colors.ink, fontWeight: '900' }
});
