import React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { videoActions } from '../api/actions';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { colors, topInset } from '../theme';
import { mediaSource } from '../utils/media';

export function VideoScreen({ data, api, reload, setActive }) {
  const videos = data?.videos || [];
  const like = async (id) => { await videoActions.like(api, id); await reload(); };
  return <View style={styles.wrap}>
    <View style={styles.head}><Text style={styles.title}>Видео</Text><Pressable onPress={() => setActive('createVideo')} style={styles.add}><Icon name="plus" color={colors.white} /></Pressable></View>
    {videos.length ? <ScrollView pagingEnabled showsVerticalScrollIndicator={false}>{videos.map((v) => (
      <ImageBackground key={v.id} source={mediaSource(v)} style={styles.video} imageStyle={styles.image}>
        <View style={styles.overlay}><Text style={styles.caption}>{v.caption || 'Видео в Миг'}</Text><Text style={styles.meta}>{v.location || ''}</Text></View>
        <View style={styles.side}><Pressable onPress={() => like(v.id)} style={styles.sideBtn}><Icon name={v.liked ? 'heartOn' : 'heart'} color={colors.white} size={30} /></Pressable><Text style={styles.count}>{v.likes || 0}</Text></View>
      </ImageBackground>
    ))}</ScrollView> : <EmptyState title="Пока нет видео" text="Добавьте первое короткое видео из галереи." action="Добавить видео" onPress={() => setActive('createVideo')} />}
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.black },
  head: { paddingTop: topInset + 8, paddingHorizontal: 20, height: topInset + 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.white, fontSize: 24, fontWeight: '900' },
  add: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  video: { width: '100%', height: 640, justifyContent: 'flex-end' },
  image: { opacity: .9 },
  overlay: { padding: 24, paddingBottom: 98 },
  caption: { color: colors.white, fontSize: 21, fontWeight: '900' },
  meta: { color: colors.white, opacity: .82, marginTop: 8 },
  side: { position: 'absolute', right: 18, bottom: 145, alignItems: 'center' },
  sideBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0,0,0,.25)', alignItems: 'center', justifyContent: 'center' },
  count: { color: colors.white, fontWeight: '900', marginTop: 6 }
});
