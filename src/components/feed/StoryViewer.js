import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { MediaView } from '../media/MediaView';
import { ActionSheet, ActionSheetItem } from '../ui/action-sheet';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/button';
import { Icon } from '../ui/MigIcon';
import { Text } from '../ui/text';
import { colors } from '../../theme';
import { blockUser, reportContent } from '../../utils/moderation';

export function StoryViewer({ story, visible, onClose, api, reload }) {
  const [menu, setMenu] = useState(false);
  const insets = useSafeAreaInsets();
  if (!story) return null;
  const report = () => reportContent(api, { targetType: 'story', targetId: story.id, targetUserId: story.author?.id });
  const block = () => blockUser(api, story.author?.id, async () => { await reload?.(); onClose?.(); });
  const closeThen = (fn) => { setMenu(false); fn?.(); };
  return <Modal visible={visible} animationType="fade" onRequestClose={onClose} accessibilityViewIsModal>
    <View style={styles.wrap}>
      <MediaView item={story} style={styles.media} shouldPlay muted={false} controls />
      <View style={styles.dark} />
      <View style={[styles.head, { top: insets.top + 8 }]}><Avatar user={story.author} size={42} /><View style={{ flex: 1 }}><Text className="text-base font-black text-white">{story.author?.name || 'Близз'}</Text><Text className="mt-0.5 font-bold text-white/75">{story.location || story.mood || 'История'}</Text></View><Button variant="ghost" size="icon" onPress={() => setMenu(true)} accessibilityLabel="Действия"><Icon name="more" size={20} color={colors.white} /></Button><Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Закрыть историю"><Icon name="close" size={30} color={colors.white} /></Pressable></View>
      <View style={styles.storyText}>{story.caption ? <Text style={styles.caption}>{story.caption}</Text> : null}{story.linkUrl ? <Pressable onPress={() => Linking.openURL(story.linkUrl)} accessibilityRole="link"><Text numberOfLines={1} style={styles.link}>{story.linkUrl}</Text></Pressable> : null}</View>
      <ActionSheet visible={menu} title="История" description="Действия с этой историей" onClose={() => setMenu(false)}>
        <ActionSheetItem label="Пожаловаться" onPress={() => closeThen(report)} />
        <ActionSheetItem label="Заблокировать автора" tone="destructive" onPress={() => closeThen(block)} />
      </ActionSheet>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.black, justifyContent: 'center' },
  media: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  dark: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,.22)' },
  head: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  storyText: { position: 'absolute', left: 20, right: 20, bottom: 82, gap: 8 },
  caption: { color: colors.white, fontSize: 22, lineHeight: 29, fontWeight: '900' },
  link: { color: '#FFFFFF', fontSize: 15, lineHeight: 20, fontWeight: '900', textDecorationLine: 'underline' }
});
