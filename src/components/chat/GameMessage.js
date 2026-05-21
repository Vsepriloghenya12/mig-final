import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { CardsGame } from '../games/CardsGame';
import { CupsGame } from '../games/CupsGame';
import { FootballGame } from '../games/FootballGame';

const names = { cups: 'Напёрстки', cards: 'Три карты', football: 'Футбол' };

export function GameMessage({ game, currentUserId, onAccept, onDecline, onMove }) {
  const mine = game.creatorId === currentUserId;
  const waiting = game.status === 'pending_acceptance';
  const canAccept = waiting && !mine;
  const canMove = (game.status === 'creator_turn' && mine) || (game.status === 'opponent_turn' && !mine);
  const title = names[game.type] || 'Игра';
  const Component = game.type === 'cards' ? CardsGame : game.type === 'football' ? FootballGame : CupsGame;
  return <View style={styles.box}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.status}>{statusText(game, mine)}</Text>
    {canAccept ? <View style={styles.actions}><Pressable onPress={onAccept} style={styles.accept}><Text style={styles.acceptText}>Принять</Text></Pressable><Pressable onPress={onDecline} style={styles.decline}><Text style={styles.declineText}>Отклонить</Text></Pressable></View> : <Component game={game} canMove={canMove} onMove={onMove} />}
  </View>;
}

function statusText(game, mine) {
  if (game.status === 'pending_acceptance') return mine ? 'Ожидаем подтверждение' : 'Вас пригласили сыграть';
  if (game.status === 'creator_turn') return mine ? 'Сделайте выбор' : 'Собеседник выбирает';
  if (game.status === 'opponent_turn') return mine ? 'Собеседник угадывает' : 'Ваш ход';
  if (game.status === 'declined') return 'Игра отклонена';
  if (game.status === 'finished') return game.result === 'hit' ? 'Угадал' : game.result === 'save' ? 'Сейв' : game.result === 'goal' ? 'Гол' : 'Не угадал';
  return 'Игра';
}

const styles = StyleSheet.create({
  box: { width: 260, borderRadius: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, padding: 14 },
  title: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  status: { color: colors.muted, marginTop: 4, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  accept: { flex: 1, backgroundColor: colors.hot, borderRadius: 18, padding: 10, alignItems: 'center' },
  decline: { flex: 1, backgroundColor: colors.faint, borderRadius: 18, padding: 10, alignItems: 'center' },
  acceptText: { color: colors.white, fontWeight: '900' },
  declineText: { color: colors.ink, fontWeight: '900' }
});
