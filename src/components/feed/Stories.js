import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, moodColors } from '../../theme';
import { mediaSource } from '../../utils/media';
import { Avatar } from '../ui/Avatar';

export function Stories({ stories = [], currentUser, onAdd, onOpen }) {
  return <View style={styles.wrap}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pressable onPress={onAdd} style={styles.story}>
        <View style={[styles.ring, { borderColor: colors.hot }]}><Avatar user={currentUser} size={58} /></View>
        <View style={styles.plus}><Text style={styles.plusText}>+</Text></View>
        <Text numberOfLines={1} style={styles.name}>Ваш миг</Text>
      </Pressable>
      {stories.map((story) => {
        const source = mediaSource(story);
        return <Pressable key={story.id} onPress={() => onOpen?.(story)} style={styles.story}>
          <View style={[styles.ring, { borderColor: moodColors[story.mood] || moodColors.default }]}>
            {source ? <Image source={source} style={styles.photo} /> : <Avatar user={story.author} size={58} />}
          </View>
          <Text numberOfLines={1} style={styles.name}>{story.author?.name || 'Миг'}</Text>
        </Pressable>;
      })}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 5, paddingBottom: 8, backgroundColor: colors.bg },
  row: { paddingHorizontal: 16, gap: 14 },
  story: { width: 68, alignItems: 'center' },
  ring: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, padding: 3, overflow: 'hidden', backgroundColor: colors.white },
  photo: { width: '100%', height: '100%', borderRadius: 28 },
  plus: { position: 'absolute', top: 47, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  plusText: { color: colors.white, fontWeight: '900', marginTop: -1 },
  name: { marginTop: 7, fontSize: 12, color: colors.text, fontWeight: '800' }
});
