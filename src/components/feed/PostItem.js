import React, { useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { colors } from '../../theme';
import { useTheme } from '../../theme-context';
import { ResizeMode } from 'expo-av';
import { MediaView } from '../media/MediaView';
import { isVideoMedia, mediaSource, mediaUrl } from '../../utils/media';
import { ActionSheet, ActionSheetItem } from '../ui/action-sheet';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/badge';
import { BrandActionIcon } from '../ui/BrandActionIcon';
import { Icon } from '../ui/MigIcon';

function normalizedMedia(post) {
  const raw = [];
  const add = (item) => {
    if (!item) return;
    if (typeof item === 'string') raw.push({ mediaUrl: item });
    else raw.push(item);
  };
  if (Array.isArray(post?.media)) post.media.forEach(add);
  if (Array.isArray(post?.mediaItems)) post.mediaItems.forEach(add);
  if (Array.isArray(post?.mediaList)) post.mediaList.forEach(add);
  if (Array.isArray(post?.images)) post.images.forEach(add);
  if (Array.isArray(post?.imageUrls)) post.imageUrls.forEach(add);
  if (Array.isArray(post?.attachments)) post.attachments.forEach(add);
  add(post?.imageUrl ? { imageUrl: post.imageUrl, mediaType: 'image' } : null);
  add(post?.videoUrl ? { videoUrl: post.videoUrl, mediaType: 'video' } : null);
  const seen = new Set();
  return raw.filter((item) => {
    const url = mediaUrl(item);
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return !!mediaSource(item);
  });
}

export function PostItem({ post, onLike, onSave, onComment, onOpenProfile, onReport, onBlock }) {
  const [menu, setMenu] = useState(false);
  const { palette } = useTheme();
  const [page, setPage] = useState(0);
  const { width } = useWindowDimensions();
  const media = useMemo(() => normalizedMedia(post), [post]);
  const imageH = Math.min(Math.round((width - 24) * 0.98), 460);
  const share = () => Share.share({ message: `${post.author?.name || 'Близз'}: ${post.caption || 'Публикация в Близз'}` });
  const closeThen = (fn) => { setMenu(false); fn?.(); };
  const itemWidth = width;

  return (
    <View style={styles.post}>
      <View style={styles.authorRow}>
        <Pressable onPress={() => onOpenProfile?.(post.author)} style={styles.authorTap} accessibilityRole="button" accessibilityLabel="Открыть профиль автора">
          <Avatar user={post.author} size={44} />
          <View style={styles.authorMeta}>
            <Text numberOfLines={1} style={[styles.handle, { color: palette.ink }]}>{post.author?.handle || post.author?.name}</Text>
            <View style={styles.metaRow}>
              <Badge variant="secondary" className="px-2.5 py-1"><Text style={styles.badgeText}>{post.location || 'Близз'}</Text></Badge>
              {post.timeLabel ? <Text style={[styles.meta, { color: palette.muted }]}>{post.timeLabel}</Text> : null}
            </View>
          </View>
        </Pressable>
        <Pressable onPress={() => setMenu(true)} hitSlop={10} style={styles.more} accessibilityRole="button" accessibilityLabel="Действия с публикацией">
          <Icon name="more" size={19} color={palette.muted} />
        </Pressable>
      </View>

      {media.length ? (
        <View style={[styles.imageFrame, { height: imageH }]}> 
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / itemWidth))}
          >
            {media.map((item, index) => (
              <MediaView
                key={`${mediaUrl(item)}-${index}`}
                item={item}
                style={[styles.image, { width: itemWidth, height: imageH }]}
                controls={isVideoMedia(item)}
                muted={false}
                resizeMode={ResizeMode.CONTAIN}
              />
            ))}
          </ScrollView>
          {media.length > 1 ? (
            <View style={styles.dots} pointerEvents="none">
              {media.map((_, index) => <View key={index} style={[styles.dot, index === page && styles.dotActive]} />)}
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionGroup}>
          <Pressable onPress={onLike} style={styles.action} accessibilityRole="button" accessibilityLabel="Отметить публикацию">
            <BrandActionIcon name="like" size={44} active={post.liked} />
          </Pressable>
          <Pressable onPress={onComment} style={styles.action} accessibilityRole="button" accessibilityLabel="Открыть комментарии">
            <BrandActionIcon name="comment" size={44} />
          </Pressable>
          <Pressable onPress={share} style={styles.action} accessibilityRole="button" accessibilityLabel="Поделиться">
            <BrandActionIcon name="share" size={44} />
          </Pressable>
        </View>
        <Pressable onPress={onSave} style={styles.action} accessibilityRole="button" accessibilityLabel="Сохранить публикацию">
          <BrandActionIcon name="save" size={44} active={post.saved} />
        </Pressable>
      </View>

      <Text style={[styles.likes, { color: palette.ink }]}>{post.likes || 0} отметок</Text>
      {post.caption ? <Text style={[styles.caption, { color: palette.text }]}><Text style={[styles.bold, { color: palette.ink }]}>{post.author?.handle || 'user'} </Text>{post.caption}</Text> : null}
      {post.linkUrl ? <Pressable onPress={() => Linking.openURL(post.linkUrl)} accessibilityRole="link"><Text numberOfLines={1} style={styles.link}>{post.linkUrl}</Text></Pressable> : null}
      {post.commentsCount ? <Pressable onPress={onComment} accessibilityRole="button"><Text style={[styles.comments, { color: palette.muted }]}>Комментарии · {post.commentsCount}</Text></Pressable> : null}

      <ActionSheet visible={menu} title="Публикация" description="Выберите действие" onClose={() => setMenu(false)}>
        <ActionSheetItem icon="more" label="Пожаловаться" description="Отправить публикацию на проверку" onPress={() => closeThen(onReport)} />
        <ActionSheetItem icon="close" label="Заблокировать автора" description="Скрыть публикации этого автора" tone="destructive" onPress={() => closeThen(onBlock)} />
      </ActionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  post: { marginBottom: 20 },
  authorRow: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorTap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  authorMeta: { flex: 1 },
  handle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4, flexWrap: 'wrap' },
  badgeText: { color: colors.hot, fontSize: 11, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  more: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  imageFrame: { marginHorizontal: 0, overflow: 'hidden', backgroundColor: 'transparent' },
  image: { backgroundColor: 'transparent' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.55)' },
  dotActive: { backgroundColor: colors.hot, width: 18 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 10 },
  actionGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  action: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  likes: { paddingHorizontal: 18, color: colors.ink, fontWeight: '900', marginTop: 6, fontSize: 14 },
  caption: { paddingHorizontal: 18, marginTop: 7, color: colors.text, lineHeight: 20, fontSize: 14 },
  bold: { fontWeight: '900', color: colors.ink },
  link: { paddingHorizontal: 18, color: colors.blue, fontWeight: '800', marginTop: 7 },
  comments: { paddingHorizontal: 18, color: colors.muted, fontWeight: '800', marginTop: 8, fontSize: 13 },
});
