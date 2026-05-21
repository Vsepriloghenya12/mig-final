import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function FootballGame({ game, canMove, onMove }) {
  return <View style={styles.goal}>{['1','2','3','4','5','6'].map((key) => {
    const chosen = game.status === 'finished' && (game.creatorChoice === key || game.opponentChoice === key);
    return <Pressable key={key} disabled={!canMove} onPress={() => onMove(key)} style={[styles.zone, chosen && styles.chosen]}><Text style={styles.ball}>{chosen ? '●' : ''}</Text></Pressable>;
  })}</View>;
}

const styles = StyleSheet.create({
  goal: { height: 118, borderWidth: 3, borderColor: colors.ink, borderBottomWidth: 8, borderRadius: 14, flexDirection: 'row', flexWrap: 'wrap', overflow: 'hidden', marginTop: 8 },
  zone: { width: '33.333%', height: '50%', borderWidth: .5, borderColor: '#DAD5EA', alignItems: 'center', justifyContent: 'center' },
  chosen: { backgroundColor: '#FFF1F8' },
  ball: { color: colors.hot, fontSize: 24 }
});
