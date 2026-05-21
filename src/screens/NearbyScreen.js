import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { placeActions } from '../api/actions';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { colors, topInset } from '../theme';
import { mediaSource } from '../utils/media';

const markerPos = [{ left: '20%', top: '34%' }, { left: '52%', top: '44%' }, { left: '72%', top: '28%' }, { left: '38%', top: '63%' }];

export function NearbyScreen({ data, api, reload, setActive }) {
  const places = data?.places || [];
  const checkin = async (id) => { await placeActions.checkin(api, id); await reload(); };
  return <View style={styles.wrap}>
    <View style={styles.head}><Text style={styles.title}>Рядом</Text><Pressable onPress={() => setActive('createPlace')} style={styles.plus}><Icon name="plus" color={colors.hot} size={25} /></Pressable></View>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.filterRow}><Text style={styles.chipOn}>рядом</Text><Text style={styles.chip}>сейчас</Text><Text style={styles.chip}>фильтры</Text></View>
      <View style={styles.map}>
        <View style={styles.roadA} /><View style={styles.roadB} /><View style={styles.roadC} />
        <View style={styles.pulse} />
        {places.slice(0, 4).map((p, i) => <View key={p.id} style={[styles.marker, markerPos[i % markerPos.length]]}><Icon name="near" active size={20} color={colors.white} /></View>)}
      </View>
      <Text style={styles.section}>Отметки рядом</Text>
      {places.length ? places.map((p) => <PlaceRow key={p.id} place={p} onCheckin={() => checkin(p.id)} />) : <EmptyState title="Пока нет мест рядом" text="Добавьте первое место, чтобы оно появилось на карте." action="Добавить место" onPress={() => setActive('createPlace')} />}
    </ScrollView>
  </View>;
}

function PlaceRow({ place, onCheckin }) {
  const source = mediaSource(place);
  return <View style={styles.row}>
    {source ? <Image source={source} style={styles.photo} /> : <View style={styles.photoBlank}><Icon name="near" size={24} color={colors.hot} /></View>}
    <View style={styles.info}><Text style={styles.name}>{place.name}</Text><Text style={styles.addr}>{place.address || 'Рядом с вами'}</Text><Text style={styles.meta}>{place.checkins || 0} отметок</Text></View>
    <Pressable onPress={onCheckin} style={styles.go}><Text style={styles.goText}>Я тут</Text></Pressable>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { paddingTop: topInset + 10, paddingHorizontal: 20, height: topInset + 72, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink },
  plus: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 118 },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingBottom: 12 },
  chip: { overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 17, backgroundColor: colors.faint, color: colors.ink, fontWeight: '900' },
  chipOn: { overflow: 'hidden', paddingHorizontal: 13, paddingVertical: 7, borderRadius: 17, backgroundColor: '#EFEAFF', color: colors.violet, fontWeight: '900' },
  map: { height: 185, marginHorizontal: 16, marginBottom: 18, overflow: 'hidden', borderRadius: 22, backgroundColor: '#F3F5FB' },
  roadA: { position: 'absolute', left: -30, right: -30, top: 72, height: 18, backgroundColor: '#FFFFFF', transform: [{ rotate: '-12deg' }] },
  roadB: { position: 'absolute', left: 96, top: -20, bottom: -20, width: 16, backgroundColor: '#FFFFFF', transform: [{ rotate: '28deg' }] },
  roadC: { position: 'absolute', right: 34, top: -16, bottom: -16, width: 12, backgroundColor: '#FFFFFF', transform: [{ rotate: '-26deg' }] },
  pulse: { position: 'absolute', left: '47%', top: '44%', width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(47,123,255,.20)' },
  marker: { position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  section: { paddingHorizontal: 18, marginBottom: 4, color: colors.ink, fontSize: 18, fontWeight: '900' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line },
  photo: { width: 68, height: 68, borderRadius: 15, backgroundColor: colors.faint },
  photoBlank: { width: 68, height: 68, borderRadius: 15, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '900', color: colors.ink },
  addr: { color: colors.muted, fontWeight: '700', marginTop: 3 },
  meta: { color: colors.hot, fontWeight: '900', marginTop: 5, fontSize: 12 },
  go: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 17, backgroundColor: colors.softPink },
  goText: { color: colors.hot, fontWeight: '900' }
});
