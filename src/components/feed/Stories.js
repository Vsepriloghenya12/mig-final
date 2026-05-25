import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, moodColors } from '../../theme';
import { useTheme } from '../../theme-context';
import { mediaSource } from '../../utils/media';
import { Avatar } from '../ui/Avatar';

export const STORIES_HEIGHT = 104;

export function Stories({ stories = [], currentUser, onAdd, onOpen }) {
  const { palette } = useTheme();
  return <View style={styles.wrap}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pressable onPress={onAdd} style={styles.story} accessibilityRole="button" accessibilityLabel="Добавить историю">
        <View style={[styles.ring, styles.myRing]}><Avatar user={currentUser} size={56} /></View>
        <View style={styles.plus}><Text style={styles.plusText}>+</Text></View>
        <Text numberOfLines={1} style={[styles.name, { color: palette.ink }]}>Ваш близз</Text>
      </Pressable>
      {stories.map((story) => {
        const source = mediaSource(story);
        return <Pressable key={story.id} onPress={() => onOpen?.(story)} style={styles.story} accessibilityRole="button" accessibilityLabel={`История ${story.author?.name || 'Близз'}`}>
          <View style={[styles.ring, { borderColor: moodColors[story.mood] || moodColors.default }]}>
            {source ? <Image source={source} style={styles.photo} /> : <Avatar user={story.author} size={56} />}
          </View>
          <Text numberOfLines={1} style={[styles.name, { color: palette.ink }]}>{story.author?.name || 'Близз'}</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { height: STORIES_HEIGHT, paddingTop: 4, paddingBottom: 10 },
  row: { paddingHorizontal: 16, gap: 14 },
  story: { width: 74, alignItems: 'center' },
  ring: { width: 64, height: 64, borderRadius: 32, borderWidth: 2.5, padding: 3, overflow: 'hidden', backgroundColor: colors.white },
  myRing: { borderColor: colors.hot, backgroundColor: colors.softPink },
  photo: { width: '100%', height: '100%', borderRadius: 28 },
  plus: { position: 'absolute', top: 45, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  plusText: { color: colors.white, fontWeight: '900', marginTop: -1 },
  name: { marginTop: 8, fontSize: 12, color: colors.text, fontWeight: '900' }
});
