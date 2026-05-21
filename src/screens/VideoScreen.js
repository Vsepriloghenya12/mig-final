import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { videoActions } from '../api/actions';
import { CommentsSheet } from '../components/feed/CommentsSheet';
import { MediaView } from '../components/media/MediaView';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { colors, topInset } from '../theme';

const H = Dimensions.get('window').height;
export function VideoScreen({ data, api, reload, setActive }) {
  const [commentVideo, setCommentVideo] = useState(null);
  const videos = data?.videos || [];
  const act = async (fn) => { await fn(); await reload(); };
  return <View style={styles.wrap}>
    <View style={styles.head}><Text style={styles.title}>Видео</Text><Pressable onPress={() => setActive('createVideo')} style={styles.add}><Icon name="plus" color={colors.white} size={26} /></Pressable></View>
    {videos.length ? <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>{videos.map((v) => <VideoItem key={v.id} video={v} onLike={() => act(() => videoActions.like(api, v.id))} onComment={() => setCommentVideo(v)} />)}</ScrollView> : <EmptyState title="Пока нет видео" text="Добавьте первое короткое видео из галереи." action="Добавить видео" onPress={() => setActive('createVideo')} />}
    <CommentsSheet visible={!!commentVideo} post={commentVideo} onClose={() => setCommentVideo(null)} onSend={(text) => act(() => videoActions.comment(api, commentVideo.id, text))} />
  </View>;
}

function VideoItem({ video, onLike, onComment }) {
  const share = () => Share.share({ message: `${video.author?.name || 'Миг'}: ${video.caption || 'Короткое видео в Миг'}` });
  return <View style={styles.video}>
    <MediaView item={video} style={styles.media} shouldPlay muted={false} />
    <View style={styles.dark} />
    <View style={styles.overlay}><Text style={styles.caption}>{video.caption || 'Видео в Миг'}</Text><Text style={styles.meta}>{video.location || video.author?.handle || ''}</Text></View>
    <View style={styles.side}>
      <Pressable onPress={onLike} style={styles.sideBtn}><Icon name={video.liked ? 'heartOn' : 'heart'} color={colors.white} size={32} /></Pressable><Text style={styles.count}>{video.likes || 0}</Text>
      <Pressable onPress={onComment} style={styles.sideBtn}><Icon name="comment" color={colors.white} size={27} /></Pressable><Text style={styles.count}>{video.commentsCount || 0}</Text>
      <Pressable onPress={share} style={styles.sideBtn}><Icon name="share" color={colors.white} size={27} /></Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.black },
  head: { position: 'absolute', zIndex: 3, top: 0, left: 0, right: 0, paddingTop: topInset + 8, paddingHorizontal: 22, height: topInset + 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: 26, fontWeight: '900' },
  add: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', shadowColor: colors.hot, shadowOpacity: .34, shadowRadius: 16, elevation: 8 },
  video: { width: '100%', height: H, justifyContent: 'flex-end', backgroundColor: colors.black },
  media: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  dark: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.18)' },
  overlay: { paddingHorizontal: 24, paddingBottom: 122, paddingRight: 92 },
  caption: { color: colors.white, fontSize: 22, lineHeight: 28, fontWeight: '900' },
  meta: { color: colors.white, opacity: .85, marginTop: 8, fontWeight: '800' },
  side: { position: 'absolute', right: 17, bottom: 155, alignItems: 'center', gap: 8 },
  sideBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0,0,0,.26)', alignItems: 'center', justifyContent: 'center' },
  count: { color: colors.white, fontWeight: '900', marginTop: -7, marginBottom: 3 }
});
