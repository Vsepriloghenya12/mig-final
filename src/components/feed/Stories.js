import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, moodColors } from '../../theme';
import { mediaSource } from '../../utils/media';
import { Avatar } from '../ui/Avatar';

export function Stories({ stories = [], currentUser, onAdd }) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable onPress={onAdd} style={styles.story}>
          <View style={[styles.ring, { borderColor: colors.hot }]}><Avatar user={currentUser} size={62} /></View>
          <View style={styles.plus}><Text style={styles.plusText}>+</Text></View>
          <Text numberOfLines={1} style={styles.name}>Ваш миг</Text>
        </Pressable>
        {stories.map((story) => (
          <View key={story.id} style={styles.story}>
            <View style={[styles.ring, { borderColor: moodColors[story.mood] || moodColors.default }]}> 
              <Image source={mediaSource(story)} style={styles.photo} />
            </View>
            <Text numberOfLines={1} style={styles.name}>{story.author?.name || story.name || 'Миг'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, paddingBottom: 10 },
  row: { paddingHorizontal: 18, gap: 17 },
  story: { width: 74, alignItems: 'center' },
  ring: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, padding: 3, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', borderRadius: 32 },
  plus: { position: 'absolute', top: 50, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  plusText: { color: colors.white, fontWeight: '900', marginTop: -1 },
  name: { marginTop: 8, fontSize: 12, color: colors.text, fontWeight: '800' }
});
