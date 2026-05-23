import React from 'react';
import { Image, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { cardShadow, colors } from '../../theme';
import { mediaSource } from '../../utils/media';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

export function PostItem({ post, onLike, onSave, onComment, onOpenProfile, onMore }) {
  const { width } = useWindowDimensions();
  const source = mediaSource(post);
  const imageH = Math.min(Math.round((width - 44) * 0.72), 340);
  const share = () => Share.share({ message: `${post.author?.name || 'Миг'}: ${post.caption || 'Публикация в Миг'}` });
  return <View style={styles.post}>
    <View style={styles.authorRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Открыть профиль автора" onPress={() => onOpenProfile?.(post.author)} style={styles.authorTap}><Avatar user={post.author} size={38} /><View style={{ flex: 1 }}><Text style={styles.handle}>{post.author?.handle || post.author?.name}</Text><Text style={styles.meta}>{post.location || 'Миг'} · {post.timeLabel || ''}</Text></View></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Действия с публикацией" onPress={onMore} hitSlop={10} style={styles.more}><Icon name="more" size={18} color={colors.muted} /></Pressable>
    </View>
    {source ? <View style={[styles.imageFrame, { height: imageH }]}><Image source={source} style={styles.image} /></View> : null}
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel={post.liked ? 'Убрать отметку' : 'Поставить отметку'} onPress={onLike} style={styles.action}><Icon name={post.liked ? 'heartOn' : 'heart'} size={28} color={post.liked ? colors.hot : colors.ink} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Открыть комментарии" onPress={onComment} style={styles.action}><Icon name="comment" size={26} /></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Поделиться публикацией" onPress={share} style={styles.action}><Icon name="share" size={25} /></Pressable>
      <View style={{ flex: 1 }} />
      <Pressable accessibilityRole="button" accessibilityLabel={post.saved ? 'Убрать из сохранённых' : 'Сохранить публикацию'} onPress={onSave} style={styles.action}><Icon name="save" size={24} color={post.saved ? colors.violet : colors.ink} /></Pressable>
    </View>
    <Text style={styles.likes}>{post.likes || 0} отметок</Text>
    {post.caption ? <Text style={styles.caption}><Text style={styles.bold}>{post.author?.handle || 'user'} </Text>{post.caption}</Text> : null}
    {post.commentsCount ? <Pressable accessibilityRole="button" accessibilityLabel="Открыть комментарии" onPress={onComment}><Text style={styles.comments}>Комментарии · {post.commentsCount}</Text></Pressable> : null}
  </View>;
}

const styles = StyleSheet.create({
  post: { marginHorizontal: 14, marginBottom: 18, borderRadius: 28, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', ...cardShadow },
  authorRow: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  authorTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  handle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 1 },
  more: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  imageFrame: { marginHorizontal: 10, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.faint },
  image: { width: '100%', height: '100%' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 11, gap: 7 },
  action: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  likes: { paddingHorizontal: 17, color: colors.hot, fontWeight: '900', marginTop: 1, fontSize: 13 },
  caption: { paddingHorizontal: 17, marginTop: 5, color: colors.text, lineHeight: 20, fontSize: 14 },
  bold: { fontWeight: '900', color: colors.ink },
  comments: { paddingHorizontal: 17, color: colors.muted, fontWeight: '700', marginTop: 7, marginBottom: 14, fontSize: 13 }
});
