import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { placeActions } from '../api/actions';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Icon } from '../components/ui/MigIcon';
import { Text } from '../components/ui/text';
import { useTheme } from '../theme-context';
import { colors, shadow } from '../theme';
import { mediaSource } from '../utils/media';

const markerPos = [
  { left: '18%', top: '30%' },
  { left: '54%', top: '42%' },
  { left: '74%', top: '24%' },
  { left: '37%', top: '64%' },
];

export function NearbyScreen({ data, api, reload, setActive }) {
  const places = data?.places || [];
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const checkin = async (id) => { await placeActions.checkin(api, id); await reload(); };

  return (
    <View style={[styles.wrap, { backgroundColor: palette.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: insets.bottom + 118 }}
      >
        <View style={styles.head}>
          <View style={styles.headText}>
            <Text style={styles.title}>Рядом</Text>
          </View>
          <Button size="icon" variant="outline" className="h-12 w-12 rounded-full" onPress={() => setActive('createPlace')} accessibilityLabel="Добавить место">
            <Icon name="plus" color={colors.hot} size={22} />
          </Button>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <Chip label="Рядом" active />
          <Chip label="Сейчас" />
          <Chip label="Фильтры" />
        </ScrollView>

        <Card className="mx-4 mb-5 overflow-hidden rounded-[30px] border-border bg-card p-0">
          <View style={styles.map}>
            <View style={styles.roadA} />
            <View style={styles.roadB} />
            <View style={styles.roadC} />
            <View style={styles.pulseOuter}><View style={styles.pulseInner} /></View>
            {places.slice(0, 4).map((p, i) => (
              <View key={p.id} style={[styles.marker, markerPos[i % markerPos.length]]}>
                <Icon name="near" active size={18} color={colors.white} />
              </View>
            ))}
            <View style={styles.mapBadge}><Text style={styles.mapBadgeText}>Вы здесь</Text></View>
          </View>
        </Card>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Отметки рядом</Text>
          <Text style={styles.sectionCounter}>{places.length}</Text>
        </View>

        {places.length ? places.map((p) => <PlaceRow key={p.id} place={p} onCheckin={() => checkin(p.id)} />) : <EmptyNearby onPress={() => setActive('createPlace')} />}
      </ScrollView>
    </View>
  );
}

function Chip({ label, active }) {
  const { palette, isDark } = useTheme();
  return (
    <View style={[styles.chip, { backgroundColor: isDark ? palette.surface : colors.white, borderColor: palette.line }, active && { backgroundColor: isDark ? 'rgba(242,45,143,.22)' : colors.softPink, borderColor: 'rgba(242,45,143,.32)' }]}> 
      <Text style={[styles.chipText, { color: active ? colors.hot : palette.ink }]}>{label}</Text>
    </View>
  );
}

function EmptyNearby({ onPress }) {
  return (
    <Card className="mx-4 rounded-[28px] border-border bg-card p-0">
      <CardContent className="items-start px-5 py-5">
        <Text style={styles.emptyTitle}>Пока нет мест рядом</Text>
        <Button onPress={onPress} className="mt-3 rounded-full" accessibilityLabel="Добавить место">
          <Text>Добавить место</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

function PlaceRow({ place, onCheckin }) {
  const source = mediaSource(place);
  return (
    <Card className="mx-4 mb-3 rounded-[24px] border-border bg-card p-0">
      <CardContent className="flex-row items-center gap-3 px-4 py-4">
        {source ? <Image source={source} style={styles.photo} /> : <View style={styles.photoBlank}><Icon name="near" size={22} color={colors.hot} /></View>}
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.placeName}>{place.name}</Text>
          <Text numberOfLines={2} style={styles.placeAddress}>{place.address || ''}</Text>
          <Text style={styles.placeCount}>{place.checkins || 0} отметок</Text>
        </View>
        <Button size="sm" variant="secondary" className="rounded-full px-4" onPress={onCheckin} accessibilityLabel="Отметиться здесь">
          <Text className="text-primary">Я тут</Text>
        </Button>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headText: { flex: 1, paddingRight: 12 },
  title: { fontSize: 32, fontWeight: '900', color: colors.ink },
  filterRow: { gap: 10, paddingHorizontal: 18, paddingBottom: 14 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipActive: { backgroundColor: colors.softPink, borderColor: 'rgba(242,45,143,.18)' },
  chipText: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  chipTextActive: { color: colors.hot },
  map: { height: 220, overflow: 'hidden', backgroundColor: '#F3F5FB' },
  roadA: { position: 'absolute', left: -30, right: -30, top: 88, height: 20, backgroundColor: '#FFFFFF', transform: [{ rotate: '-12deg' }] },
  roadB: { position: 'absolute', left: 96, top: -20, bottom: -20, width: 16, backgroundColor: '#FFFFFF', transform: [{ rotate: '28deg' }] },
  roadC: { position: 'absolute', right: 34, top: -16, bottom: -16, width: 12, backgroundColor: '#FFFFFF', transform: [{ rotate: '-26deg' }] },
  pulseOuter: {
    position: 'absolute',
    left: '46%',
    top: '42%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(47,123,255,.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.blue },
  marker: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center', ...shadow },
  mapBadge: { position: 'absolute', left: 16, bottom: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.92)' },
  mapBadgeText: { color: colors.ink, fontWeight: '900', fontSize: 12 },
  sectionHead: { paddingHorizontal: 18, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  sectionCounter: { color: colors.hot, fontSize: 14, fontWeight: '900' },
  photo: { width: 76, height: 76, borderRadius: 20, backgroundColor: colors.faint },
  photoBlank: { width: 76, height: 76, borderRadius: 20, backgroundColor: colors.softPink, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, paddingRight: 8 },
  placeName: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  placeAddress: { color: colors.muted, fontSize: 13, fontWeight: '700', marginTop: 4, lineHeight: 18 },
  placeCount: { color: colors.hot, fontSize: 12, fontWeight: '900', marginTop: 8 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
});
