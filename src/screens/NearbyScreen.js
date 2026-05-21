import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { placeActions } from '../api/actions';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { colors, topInset } from '../theme';
import { mediaSource } from '../utils/media';

export function NearbyScreen({ data, api, reload, setActive }) {
  const places = data?.places || [];
  const checkin = async (id) => { await placeActions.checkin(api, id); await reload(); };
  return <View style={styles.wrap}><View style={styles.head}><Text style={styles.title}>Рядом</Text><Pressable onPress={() => setActive('createPlace')} style={styles.plus}><Icon name="plus" color={colors.white} /></Pressable></View>
    <ScrollView contentContainerStyle={styles.content}>
      {places.length ? places.map((p) => <View key={p.id} style={styles.row}>
        <Image source={mediaSource(p)} style={styles.photo} />
        <View style={styles.info}><Text style={styles.name}>{p.name}</Text><Text style={styles.addr}>{p.address || 'Рядом с вами'}</Text><Text style={styles.meta}>{p.checkins || 0} отметок</Text></View>
        <Pressable onPress={() => checkin(p.id)} style={styles.go}><Text style={styles.goText}>Я тут</Text></Pressable>
      </View>) : <EmptyState title="Пока нет мест рядом" text="Добавьте первое место, чтобы оно появилось здесь." action="Добавить место" onPress={() => setActive('createPlace')} />}
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { paddingTop: topInset + 10, paddingHorizontal: 20, height: topInset + 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink },
  plus: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 110 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderColor: colors.line },
  photo: { width: 78, height: 78, borderRadius: 18, backgroundColor: colors.faint },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '900', color: colors.ink },
  addr: { color: colors.muted, fontWeight: '700', marginTop: 3 },
  meta: { color: colors.hot, fontWeight: '900', marginTop: 6, fontSize: 12 },
  go: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: '#FFF1F8' },
  goText: { color: colors.hot, fontWeight: '900' }
});
