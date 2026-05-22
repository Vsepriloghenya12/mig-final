import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { postActions } from '../api/actions';
import { Header } from '../components/Header';
import { CommentsSheet } from '../components/feed/CommentsSheet';
import { PostItem } from '../components/feed/PostItem';
import { Stories } from '../components/feed/Stories';
import { StoryViewer } from '../components/feed/StoryViewer';
import { EmptyState } from '../components/ui/EmptyState';
import { colors } from '../theme';
import { blockUser, reportContent } from '../utils/moderation';

export function FeedScreen({ data, api, loading, reload, setActive, onOpenProfile }) {
  const [commentPost, setCommentPost] = useState(null);
  const [story, setStory] = useState(null);
  const posts = data?.posts || [];
  const act = async (fn) => { await fn(); await reload(); };
  const reportPost = (post) => reportContent(api, { targetType: 'post', targetId: post.id, targetUserId: post.author?.id });
  return <View style={styles.wrap}>
    <View style={styles.blobPink} /><View style={styles.blobBlue} />
    <Header onMessages={() => setActive('messages')} />
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.hot} />} contentContainerStyle={styles.content}>
      <Stories stories={data?.stories || []} currentUser={data?.currentUser} onAdd={() => setActive('createStory')} onOpen={setStory} />
      {posts.length ? posts.map((post) => <PostItem key={post.id} post={post}
        onOpenProfile={onOpenProfile}
        onLike={() => act(() => postActions.like(api, post.id))}
        onSave={() => act(() => postActions.save(api, post.id))}
        onComment={() => setCommentPost(post)}
        onReport={() => reportPost(post)}
        onBlock={() => blockUser(api, post.author?.id, reload)}
      />) : <EmptyState title="Пока нет публикаций" text="Добавьте первый Миг из галереи телефона." action="Добавить Миг" onPress={() => setActive('create')} />}
    </ScrollView>
    <CommentsSheet visible={!!commentPost} post={commentPost} onClose={() => setCommentPost(null)} onSend={(text) => act(() => postActions.comment(api, commentPost.id, text))} />
    <StoryViewer visible={!!story} story={story} onClose={() => setStory(null)} api={api} reload={reload} />
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 118 },
  blobPink: { position: 'absolute', left: -65, top: 55, width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(242,45,143,.08)' },
  blobBlue: { position: 'absolute', right: -85, top: 320, width: 230, height: 230, borderRadius: 115, backgroundColor: 'rgba(47,123,255,.07)' }
});
