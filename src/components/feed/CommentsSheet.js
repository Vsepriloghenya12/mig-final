import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../ui/Icon';

export function CommentsSheet({ post, visible, onClose, onSend }) {
  const [text, setText] = useState('');
  const send = async () => {
    if (!text.trim()) return;
    await onSend(text.trim());
    setText('');
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.header}><Text style={styles.title}>Комментарии</Text><Pressable onPress={onClose}><Icon name="close" size={25} /></Pressable></View>
        <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={styles.list}>
          {(post?.comments || []).length ? post.comments.map((c) => <View key={c.id} style={styles.comment}><Text style={styles.author}>{c.authorName}</Text><Text style={styles.text}>{c.text}</Text></View>) : <Text style={styles.empty}>Пока нет комментариев</Text>}
        </ScrollView>
        <View style={styles.inputRow}><TextInput value={text} onChangeText={setText} placeholder="Написать комментарий" placeholderTextColor={colors.muted} style={styles.input} /><Pressable onPress={send} style={styles.send}><Icon name="send" color={colors.white} size={18} /></Pressable></View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(12,10,22,.2)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 22, overflow: 'hidden' },
  header: { height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: colors.line },
  title: { fontSize: 19, fontWeight: '900', color: colors.ink },
  list: { padding: 18, gap: 12 },
  comment: { gap: 3 },
  author: { color: colors.ink, fontWeight: '900' },
  text: { color: colors.text, lineHeight: 20 },
  empty: { color: colors.muted, textAlign: 'center', padding: 30 },
  inputRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 10 },
  input: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: 23, paddingHorizontal: 16, color: colors.ink },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' }
});
