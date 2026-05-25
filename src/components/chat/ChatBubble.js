import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MediaView } from '../media/MediaView';
import { colors, softShadow } from '../../theme';
import { useTheme } from '../../theme-context';
import { GameMessage } from './GameMessage';

export function ChatBubble({ message, currentUserId, onGame, onReport }) {
  const { palette } = useTheme();
  const mine = message.userId === currentUserId;
  if (message.type === 'game') {
    return (
      <View style={[styles.row, mine && styles.mine]}>
        <Pressable onLongPress={() => onReport?.(message)} accessibilityRole="button" accessibilityLabel="Игровое сообщение">
          <GameMessage game={message.game} currentUserId={currentUserId} onAccept={() => onGame('accept', message.game.id)} onDecline={() => onGame('decline', message.game.id)} onMove={(choice) => onGame('move', message.game.id, choice)} />
        </Pressable>
      </View>
    );
  }
  const media = message.type === 'photo' || message.type === 'video';
  return (
    <View style={[styles.row, mine && styles.mine]}>
      <Pressable onLongPress={() => onReport?.(message)} style={[styles.bubble, { backgroundColor: mine ? colors.hot : palette.surface, borderColor: mine ? colors.hot : palette.line }, media && styles.mediaBubble]} accessibilityRole="button" accessibilityLabel="Сообщение">
        {media ? <MediaView item={message} style={styles.media} controls muted={false} /> : null}
        {message.text ? <Text style={[styles.text, { color: mine ? colors.white : palette.text }, mine && styles.myText, media && styles.mediaText]}>{message.text}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10, paddingHorizontal: 2 },
  mine: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '82%', borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 11, ...softShadow },
  myBubble: { backgroundColor: colors.hot, borderColor: colors.hot },
  mediaBubble: { padding: 5, overflow: 'hidden' },
  text: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '650' },
  myText: { color: colors.white, fontWeight: '800' },
  mediaText: { paddingHorizontal: 8, paddingVertical: 7 },
  media: { width: 224, height: 224, borderRadius: 19, backgroundColor: colors.faint, overflow: 'hidden' },
});
