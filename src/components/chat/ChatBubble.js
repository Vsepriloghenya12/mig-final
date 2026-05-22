import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MediaView } from '../media/MediaView';
import { colors } from '../../theme';
import { GameMessage } from './GameMessage';

export function ChatBubble({ message, currentUserId, onGame, onReport }) {
  const mine = message.userId === currentUserId;
  if (message.type === 'game') return <View style={[styles.row, mine && styles.mine]}><Pressable onLongPress={() => onReport?.(message)}><GameMessage game={message.game} currentUserId={currentUserId} onAccept={() => onGame('accept', message.game.id)} onDecline={() => onGame('decline', message.game.id)} onMove={(choice) => onGame('move', message.game.id, choice)} /></Pressable></View>;
  const media = message.type === 'photo' || message.type === 'video';
  return <View style={[styles.row, mine && styles.mine]}><Pressable onLongPress={() => onReport?.(message)} style={[styles.bubble, mine && styles.myBubble]}>
    {media ? <MediaView item={message} style={styles.media} controls muted={false} /> : null}
    {message.text ? <Text style={[styles.text, mine && styles.myText]}>{message.text}</Text> : null}
  </Pressable></View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 },
  mine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '78%', borderRadius: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, padding: 12 },
  myBubble: { backgroundColor: colors.hot, borderColor: colors.hot },
  text: { color: colors.text, fontSize: 15, lineHeight: 21 },
  myText: { color: colors.white, fontWeight: '700' },
  media: { width: 210, height: 210, borderRadius: 18, marginBottom: 8, backgroundColor: colors.faint, overflow: 'hidden' }
});
