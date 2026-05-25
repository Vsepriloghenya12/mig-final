import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../../theme';
import { useTheme } from '../../theme-context';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';
import { Icon } from '../ui/MigIcon';
import { Text } from '../ui/text';

export function CommentsSheet({ post, visible, onClose, onSend }) {
  const [text, setText] = useState('');
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const comments = useMemo(() => post?.comments || [], [post]);

  const send = async () => {
    if (!text.trim()) return;
    await onSend(text.trim());
    setText('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root} keyboardVerticalOffset={Platform.OS === 'ios' ? 6 : 0}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Закрыть комментарии" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 10), backgroundColor: palette.surface }]}> 
          <View style={styles.grabber} />
          <View style={styles.headerRow}>
            <Text style={styles.title}>Комментарии</Text>
            <Pressable onPress={onClose} hitSlop={12} style={[styles.close, { backgroundColor: palette.faint }]} accessibilityRole="button" accessibilityLabel="Закрыть комментарии">
              <Icon name="close" size={22} color={palette.ink} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {comments.length ? comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <Avatar user={{ name: c.authorName }} size={34} />
                <View style={[styles.commentCard, { backgroundColor: palette.faint }]}>
                  <Text style={styles.commentAuthor}>{c.authorName}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            )) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Пока нет комментариев</Text>
                <Text style={styles.emptyText}>Будьте первым, кто оставит комментарий к этому Близзу.</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputDock}>
            <View style={[styles.inputWrap, { backgroundColor: palette.surface, borderColor: palette.line }]}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Написать комментарий"
                placeholderTextColor={palette.muted}
                style={[styles.input, { color: palette.ink }]}
                accessibilityLabel="Комментарий"
              />
            </View>
            <Button onPress={send} disabled={!text.trim()} size="icon" className="h-12 w-12 rounded-full" accessibilityLabel="Отправить комментарий">
              <Icon name="send" color={colors.white} size={18} />
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 14,
    maxHeight: '80%',
    ...shadow,
  },
  grabber: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.line,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.ink,
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flexGrow: 0 },
  list: { paddingTop: 6, paddingBottom: 14, gap: 12 },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentCard: {
    flex: 1,
    backgroundColor: colors.faint,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.ink,
    marginBottom: 4,
  },
  commentText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 240,
  },
  inputDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  inputWrap: {
    flex: 1,
    minHeight: 50,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  input: {
    minHeight: 46,
    color: colors.ink,
    fontWeight: '700',
  },
});
