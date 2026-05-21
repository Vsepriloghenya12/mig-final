import React from 'react';
import { Image, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors } from '../../theme';
import { mediaSource } from '../../utils/media';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

export function PostItem({ post, onLike, onSave, onComment, onOpenProfile }) {
  const { width } = useWindowDimensions();
  const source = mediaSource(post);
  const imageH = Math.min(Math.round((width - 32) * 0.72), 340);
  const share = () => Share.share({ message: `${post.author?.name || 'Миг'}: ${post.caption || 'Публикация в Миг'}` });
  return (
    <View style={styles.post}>
      <Pressable onPress={() => onOpenProfile?.(post.author)} style={styles.authorRow}>
        <Avatar user={post.author} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={styles.handle}>{post.author?.handle || post.author?.name}</Text>
          <Text style={styles.meta}>{post.location || 'Миг'} · {post.timeLabel || ''}</Text>
        </View>
        <Icon name="more" size={18} color={colors.muted} />
      </Pressable>
      {source ? <View style={[styles.imageFrame, { height: imageH }]}><Image source={source} style={styles.image} /></View> : null}
      <View style={styles.actions}>
        <Pressable onPress={onLike} style={styles.action}><Icon name={post.liked ? 'heartOn' : 'heart'} size={28} color={post.liked ? colors.hot : colors.ink} /></Pressable>
        <Pressable onPress={onComment} style={styles.action}><Icon name="comment" size={26} /></Pressable>
        <Pressable onPress={share} style={styles.action}><Icon name="share" size={25} /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onSave} style={styles.action}><Icon name="save" size={24} color={post.saved ? colors.violet : colors.ink} /></Pressable>
      </View>
      <Text style={styles.likes}>{post.likes || 0} отметок</Text>
      {post.caption ? <Text style={styles.caption}><Text style={styles.bold}>{post.author?.handle || 'user'} </Text>{post.caption}</Text> : null}
      {post.commentsCount ? <Pressable onPress={onComment}><Text style={styles.comments}>Комментарии · {post.commentsCount}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  post: { marginBottom: 22 },
  authorRow: { paddingHorizontal: 18, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  handle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 1 },
  imageFrame: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.faint },
  image: { width: '100%', height: '100%' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17, paddingTop: 9, gap: 8 },
  action: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  likes: { paddingHorizontal: 20, color: colors.hot, fontWeight: '900', marginTop: 1, fontSize: 13 },
  caption: { paddingHorizontal: 20, marginTop: 5, color: colors.text, lineHeight: 19, fontSize: 14 },
  bold: { fontWeight: '900', color: colors.ink },
  comments: { paddingHorizontal: 20, color: colors.muted, fontWeight: '700', marginTop: 7, fontSize: 13 }
});
