import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MediaView } from '../media/MediaView';
import { Avatar } from '../ui/Avatar';
import { Icon } from '../ui/Icon';
import { colors, topInset } from '../../theme';
import { blockUser, reportContent } from '../../utils/moderation';

export function StoryViewer({ story, visible, onClose, api, reload }) {
  if (!story) return null;
  const report = () => reportContent(api, { targetType: 'story', targetId: story.id, targetUserId: story.author?.id });
  const block = () => blockUser(api, story.author?.id, async () => { await reload?.(); onClose?.(); });
  return <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
    <View style={styles.wrap}>
      <MediaView item={story} style={styles.media} shouldPlay muted={false} controls />
      <View style={styles.dark} />
      <View style={styles.head}><Avatar user={story.author} size={42} /><View style={{ flex: 1 }}><Text style={styles.name}>{story.author?.name || 'Миг'}</Text><Text style={styles.meta}>{story.location || story.mood || 'История'}</Text></View><Pressable onPress={onClose} hitSlop={12}><Icon name="close" size={30} color={colors.white} /></Pressable></View>
      {story.caption ? <Text style={styles.caption}>{story.caption}</Text> : null}
      <View style={styles.actions}><Pressable onPress={report} style={styles.action}><Text style={styles.actionText}>Пожаловаться</Text></Pressable><Pressable onPress={block} style={styles.action}><Text style={styles.actionText}>Блок</Text></Pressable></View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.black, justifyContent: 'center' },
  media: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  dark: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.16)' },
  head: { position: 'absolute', top: topInset + 8, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  name: { color: colors.white, fontWeight: '900', fontSize: 16 },
  meta: { color: 'rgba(255,255,255,.76)', fontWeight: '700', marginTop: 2 },
  caption: { position: 'absolute', left: 20, right: 20, bottom: 82, color: colors.white, fontSize: 22, lineHeight: 29, fontWeight: '900' },
  actions: { position: 'absolute', left: 18, right: 18, bottom: 26, flexDirection: 'row', gap: 10 },
  action: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: 'rgba(255,255,255,.18)' },
  actionText: { color: colors.white, fontWeight: '900' }
});
