import React from 'react';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { mediaSource } from '../../utils/media';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';

export function PostItem({ post, onLike, onSave, onComment, onOpenProfile }) {
  const share = () => Share.share({ message: `${post.author?.name || 'Миг'}: ${post.caption || 'Публикация в Миг'}` });
  return (
    <View style={styles.post}>
      <Pressable onPress={() => onOpenProfile?.(post.author)} style={styles.authorRow}>
        <Avatar user={post.author} size={42} />
        <View style={{ flex: 1 }}>
          <Text style={styles.handle}>{post.author?.handle || post.author?.name}</Text>
          <Text style={styles.meta}>{post.location || 'Миг'} · {post.timeLabel || ''}</Text>
        </View>
        <Icon name="more" size={18} color={colors.muted} />
      </Pressable>
      <Image source={mediaSource(post)} style={styles.image} />
      <View style={styles.actions}>
        <Pressable onPress={onLike} style={styles.action}><Icon name={post.liked ? 'heartOn' : 'heart'} size={29} color={post.liked ? colors.hot : colors.ink} /></Pressable>
        <Pressable onPress={onComment} style={styles.action}><Icon name="comment" size={29} /></Pressable>
        <Pressable onPress={share} style={styles.action}><Icon name="share" size={27} /></Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onSave} style={styles.action}><Icon name="save" size={25} color={post.saved ? colors.violet : colors.ink} /></Pressable>
      </View>
      <Text style={styles.likes}>{post.likes || 0} отметок</Text>
      {post.caption ? <Text style={styles.caption}><Text style={styles.bold}>{post.author?.handle || 'user'} </Text>{post.caption}</Text> : null}
      {post.commentsCount ? <Pressable onPress={onComment}><Text style={styles.comments}>Открыть комментарии · {post.commentsCount}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  post: { marginBottom: 22 },
  authorRow: { paddingHorizontal: 18, paddingVertical: 11, flexDirection: 'row', alignItems: 'center', gap: 11 },
  handle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.faint },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 10, gap: 8 },
  action: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  likes: { paddingHorizontal: 18, color: colors.hot, fontWeight: '900', marginTop: 2 },
  caption: { paddingHorizontal: 18, marginTop: 6, color: colors.text, lineHeight: 20 },
  bold: { fontWeight: '900', color: colors.ink },
  comments: { paddingHorizontal: 18, color: colors.muted, fontWeight: '700', marginTop: 8 }
});
