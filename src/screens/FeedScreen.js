import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { postActions } from '../api/actions';
import { Header } from '../components/Header';
import { CommentsSheet } from '../components/feed/CommentsSheet';
import { PostItem } from '../components/feed/PostItem';
import { Stories } from '../components/feed/Stories';
import { EmptyState } from '../components/ui/EmptyState';
import { colors } from '../theme';

export function FeedScreen({ data, api, loading, reload, setActive }) {
  const [commentPost, setCommentPost] = useState(null);
  const posts = data?.posts || [];
  const act = async (fn) => { await fn(); await reload(); };
  return (
    <View style={styles.wrap}>
      <Header onMessages={() => setActive('messages')} />
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} tintColor={colors.hot} />} contentContainerStyle={styles.content}>
        <Stories stories={data?.stories || []} currentUser={data?.currentUser} onAdd={() => setActive('createStory')} />
        {posts.length ? posts.map((post) => <PostItem key={post.id} post={post}
          onLike={() => act(() => postActions.like(api, post.id))}
          onSave={() => act(() => postActions.save(api, post.id))}
          onComment={() => setCommentPost(post)}
        />) : <EmptyState title="Пока нет публикаций" text="Добавьте первый Миг из галереи телефона." action="Добавить Миг" onPress={() => setActive('create')} />}
      </ScrollView>
      <CommentsSheet visible={!!commentPost} post={commentPost} onClose={() => setCommentPost(null)} onSend={(text) => act(() => postActions.comment(api, commentPost.id, text))} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 110 }
});
