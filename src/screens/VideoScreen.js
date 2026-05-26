import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AppState, FlatList, Pressable, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { videoActions } from '../api/actions';
import { CommentsSheet } from '../components/feed/CommentsSheet';
import { MediaView } from '../components/media/MediaView';
import { ActionSheet, ActionSheetItem } from '../components/ui/action-sheet';
import { Avatar } from '../components/ui/Avatar';
import { BrandActionIcon } from '../components/ui/BrandActionIcon';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { useTheme } from '../theme-context';
import { colors, shadow } from '../theme';
import { blockUser, reportContent } from '../utils/moderation';

export function VideoScreen({ data, setData, api, reload, setActive, onOpenProfile }) {
  const [commentVideo, setCommentVideo] = useState(null);
  const { palette } = useTheme();
  const [activeId, setActiveId] = useState(null);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const videos = data?.videos || [];
  const act = async (fn) => { const next = await fn(); if (next?.posts || next?.videos || next?.stories) setData?.(next); else await reload(); };
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 });
  const onViewableItemsChanged = useRef(({ viewableItems }) => setActiveId(viewableItems?.[0]?.item?.id || null));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <VideoItem
      video={item}
      height={height}
      bottomOffset={Math.max(insets.bottom, 10)}
      active={appActive && (activeId ? activeId === item.id : index === 0)}
      onLike={() => act(() => videoActions.like(api, item.id))}
      onComment={() => setCommentVideo(item)}
      onReport={() => reportContent(api, { targetType: 'video', targetId: item.id, targetUserId: item.author?.id })}
      onBlock={() => blockUser(api, item.author?.id, reload)}
      onOpenProfile={() => onOpenProfile?.(item.author)}
    />
  ), [activeId, api, appActive, height, insets.bottom, onOpenProfile, reload]);

  const getItemLayout = useCallback((_, index) => ({ length: height, offset: height * index, index }), [height]);

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      <View style={[styles.head, { paddingTop: insets.top + 8, height: insets.top + 74 }]}> 
        <View style={styles.headPill}><Text style={styles.headTitle}>Видео</Text></View>
        <Button size="icon" className="h-11 w-11 rounded-full" onPress={() => setActive('createVideo')} accessibilityLabel="Добавить видео">
          <Icon name="plus" color={colors.white} size={24} />
        </Button>
      </View>
      {videos.length ? (
        <FlatList
          data={videos}
          keyExtractor={(item) => String(item.id)}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={height}
          decelerationRate="fast"
          viewabilityConfig={viewabilityConfig.current}
          onViewableItemsChanged={onViewableItemsChanged.current}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews
        />
      ) : (
        <View style={[styles.empty, { paddingTop: insets.top + 72 }]}><EmptyState title="Пока нет видео" action="Добавить видео" onPress={() => setActive('createVideo')} /></View>
      )}
      <CommentsSheet visible={!!commentVideo} post={commentVideo} onClose={() => setCommentVideo(null)} onSend={(text) => act(() => videoActions.comment(api, commentVideo.id, text))} />
    </View>
  );
}

const VideoItem = memo(function VideoItem({ video, active, height, bottomOffset, onLike, onComment, onReport, onBlock, onOpenProfile }) {
  const [menu, setMenu] = useState(false);
  const share = () => Share.share({ message: `${video.author?.name || 'Близз'}: ${video.caption || 'Короткое видео в Близз'}` });
  const closeThen = (fn) => { setMenu(false); fn?.(); };
  return (
    <View style={[styles.video, { height }]}> 
      <MediaView item={video} style={styles.media} shouldPlay={active} muted={false} />
      <View style={styles.dark} />
      <View style={[styles.infoPanel, { bottom: bottomOffset + 116 }]}> 
        <Pressable onPress={onOpenProfile} style={styles.authorRow} accessibilityRole="button" accessibilityLabel="Открыть профиль автора">
          <Avatar user={video.author} size={38} />
          <View style={styles.authorText}>
            <Text numberOfLines={1} style={styles.authorName}>{video.author?.handle || video.author?.name || 'Близз'}</Text>
            {video.location ? <Text numberOfLines={1} style={styles.location}>{video.location}</Text> : null}
          </View>
        </Pressable>
        {video.caption ? <Text numberOfLines={3} style={styles.caption}>{video.caption}</Text> : null}
      </View>
      <View style={[styles.side, { bottom: bottomOffset + 126 }]}> 
        <VideoAction onPress={onLike} label={String(video.likes || 0)} accessibilityLabel="Отметить видео" icon={video.liked ? 'heartOn' : 'heart'} />
        <VideoAction onPress={onComment} label={String(video.commentsCount || 0)} accessibilityLabel="Комментарии" icon="comment" />
        <VideoAction onPress={share} accessibilityLabel="Поделиться" icon="share" />
        <Pressable onPress={() => setMenu(true)} style={styles.moreBtn} accessibilityRole="button" accessibilityLabel="Действия">
          <Icon name="more" color={colors.white} size={20} />
        </Pressable>
      </View>
      <ActionSheet visible={menu} title="Видео" onClose={() => setMenu(false)}>
        <ActionSheetItem icon="more" label="Пожаловаться" onPress={() => closeThen(onReport)} />
        <ActionSheetItem icon="close" label="Заблокировать автора" tone="destructive" onPress={() => closeThen(onBlock)} />
      </ActionSheet>
    </View>
  );
});

function VideoAction({ onPress, icon, label, accessibilityLabel }) {
  const brand = icon === 'heart' || icon === 'heartOn' ? 'like' : icon === 'comment' ? 'comment' : icon === 'share' ? 'share' : null;
  return (
    <View style={styles.actionWrap}>
      <Pressable onPress={onPress} style={styles.sideBtn} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        {brand ? <BrandActionIcon name={brand} size={46} active={icon === 'heartOn'} /> : <Icon name={icon} color={colors.white} size={27} />}
      </Pressable>
      {label ? <Text style={styles.actionLabel}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.black },
  empty: { flex: 1, backgroundColor: colors.bg },
  head: { position: 'absolute', zIndex: 3, top: 0, left: 0, right: 0, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headPill: { minHeight: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: 'rgba(0,0,0,.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' },
  headTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  video: { width: '100%', justifyContent: 'flex-end', backgroundColor: colors.black },
  media: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  dark: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.26)' },
  infoPanel: { position: 'absolute', left: 18, right: 92, borderRadius: 26, backgroundColor: 'rgba(0,0,0,.26)', borderWidth: 1, borderColor: 'rgba(255,255,255,.14)', padding: 14 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  authorText: { flex: 1, minWidth: 0 },
  authorName: { color: colors.white, fontSize: 15, fontWeight: '900' },
  location: { color: 'rgba(255,255,255,.78)', fontSize: 12, fontWeight: '800', marginTop: 2 },
  caption: { color: colors.white, fontSize: 18, lineHeight: 24, fontWeight: '900' },
  side: { position: 'absolute', right: 15, alignItems: 'center', gap: 12 },
  actionWrap: { alignItems: 'center', gap: 5 },
  sideBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'transparent', borderWidth: 0, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: colors.white, fontSize: 12, fontWeight: '900' },
  moreBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'transparent', borderWidth: 0, alignItems: 'center', justifyContent: 'center' },
});
