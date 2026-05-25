import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { postActions } from '../api/actions';
import { Header, HEADER_EXPANDED_HEIGHT } from '../components/Header';
import { CommentsSheet } from '../components/feed/CommentsSheet';
import { PostItem } from '../components/feed/PostItem';
import { STORIES_HEIGHT, Stories } from '../components/feed/Stories';
import { StoryViewer } from '../components/feed/StoryViewer';
import { EmptyState } from '../components/ui/EmptyState';
import { Text } from '../components/ui/text';
import { colors } from '../theme';
import { useTheme } from '../theme-context';
import { blockUser, reportContent } from '../utils/moderation';

const FILTER_HEIGHT = 50;

function isBusinessPost(post) {
  const author = post?.author || {};
  const type = String(author.type || author.accountType || author.role || '').toLowerCase();
  return !!(author.isBusiness || author.business || type.includes('business') || type.includes('бизнес'));
}

function getFollowingIds(user = {}) {
  const raw = user.followingIds || user.following || user.subscriptions || [];
  if (!Array.isArray(raw)) return new Set();
  return new Set(raw.map((item) => String(item?.id || item)).filter(Boolean));
}

export function FeedScreen({ data, setData, api, loading, reload, setActive, setNavHidden, onOpenProfile }) {
  const [commentPost, setCommentPost] = useState(null);
  const [story, setStory] = useState(null);
  const [feedMode, setFeedMode] = useState('users');
  const { palette } = useTheme();
  const posts = data?.posts || [];
  const currentUser = data?.currentUser || {};
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const navHiddenRef = useRef(false);
  const act = async (fn) => { const next = await fn(); if (next?.posts || next?.videos || next?.stories) setData?.(next); else await reload(); };
  const updateNavHidden = useCallback((next) => {
    if (navHiddenRef.current === next) return;
    navHiddenRef.current = next;
    setNavHidden?.(next);
  }, [setNavHidden]);
  const handleScroll = useCallback((event) => {
    const y = Math.max(0, event.nativeEvent.contentOffset.y || 0);
    const delta = y - lastScrollY.current;
    if (y < 18) updateNavHidden(false);
    else if (delta > 7 && y > 70) updateNavHidden(true);
    else if (delta < -7) updateNavHidden(false);
    lastScrollY.current = y;
  }, [updateNavHidden]);
  const reportPost = (post) => reportContent(api, { targetType: 'post', targetId: post.id, targetUserId: post.author?.id });

  const visiblePosts = useMemo(() => {
    if (feedMode === 'business') return posts.filter(isBusinessPost);
    const followingIds = getFollowingIds(currentUser);
    const personalPosts = posts.filter((post) => !isBusinessPost(post));
    if (!followingIds.size) return personalPosts;
    return personalPosts.filter((post) => followingIds.has(String(post.author?.id)) || String(post.author?.id) === String(currentUser.id));
  }, [currentUser, feedMode, posts]);

  const storiesOverlay = useMemo(() => {
    const travelDistance = insets.top + HEADER_EXPANDED_HEIGHT + STORIES_HEIGHT + FILTER_HEIGHT + 24;
    return (
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.storiesDock,
          { backgroundColor: palette.bg,
            top: insets.top + HEADER_EXPANDED_HEIGHT + 2,
            transform: [
              { translateY: scrollY.interpolate({ inputRange: [0, 126], outputRange: [0, -travelDistance], extrapolate: 'clamp' }) },
              { scale: scrollY.interpolate({ inputRange: [0, 126], outputRange: [1, 0.72], extrapolate: 'clamp' }) },
            ],
          },
        ]}
      >
        <Stories stories={data?.stories || []} currentUser={currentUser} onAdd={() => setActive('createStory')} onOpen={setStory} />
        <View style={[styles.feedTabs, { backgroundColor: palette.bg }]}>
          <FeedTab title="Пользователи" active={feedMode === 'users'} onPress={() => setFeedMode('users')} />
          <FeedTab title="Витрина" active={feedMode === 'business'} onPress={() => setFeedMode('business')} />
        </View>
      </Animated.View>
    );
  }, [currentUser, data?.stories, feedMode, insets.top, scrollY, setActive]);

  const renderPost = useCallback(({ item }) => (
    <PostItem
      post={item}
      onOpenProfile={onOpenProfile}
      onLike={() => act(() => postActions.like(api, item.id))}
      onSave={() => act(() => postActions.save(api, item.id))}
      onComment={() => setCommentPost(item)}
      onReport={() => reportPost(item)}
      onBlock={() => blockUser(api, item.author?.id, reload)}
    />
  ), [api, onOpenProfile, reload, setData]);

  return <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
    <Header onMessages={() => setActive('messages')} scrollY={scrollY} />
    {storiesOverlay}
    <Animated.FlatList
      data={visiblePosts}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderPost}
      ListHeaderComponent={<View style={{ height: insets.top + HEADER_EXPANDED_HEIGHT + STORIES_HEIGHT + FILTER_HEIGHT + 8 }} />}
      ListEmptyComponent={<EmptyState title="Пока пусто" action={feedMode === 'business' ? undefined : 'Добавить Близз'} onPress={() => setActive('create')} />}
      refreshing={loading}
      onRefresh={reload}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
      maxToRenderPerBatch={6}
      windowSize={8}
      removeClippedSubviews
      scrollEventThrottle={16}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false, listener: handleScroll }
      )}
    />
    <CommentsSheet visible={!!commentPost} post={commentPost} onClose={() => setCommentPost(null)} onSend={(text) => act(() => postActions.comment(api, commentPost.id, text))} />
    <StoryViewer visible={!!story} story={story} onClose={() => setStory(null)} api={api} reload={reload} />
  </View>;
}

function FeedTab({ title, active, onPress }) {
  const { palette } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.feedTab} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <Text style={[styles.feedTabText, { color: active ? palette.ink : palette.muted }]}>{title}</Text>
      <View style={[styles.feedTabLine, active && styles.feedTabLineActive]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 118, flexGrow: 1 },
  storiesDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 24,
    backgroundColor: colors.bg,
  },
  feedTabs: {
    height: FILTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    backgroundColor: colors.bg,
  },
  feedTab: {
    marginRight: 24,
    paddingBottom: 9,
  },
  feedTabText: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '900',
  },
  feedTabTextActive: { color: colors.ink },
  feedTabLine: {
    height: 3,
    borderRadius: 99,
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  feedTabLineActive: { backgroundColor: colors.hot },
});
