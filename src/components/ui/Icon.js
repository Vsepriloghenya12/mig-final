import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow } from '../../theme';

function tone(active, color) { return color || (active ? colors.hot : '#686579'); }
function Fill({ children, size }) { return <View style={[s.fill, { width: size, height: size }]}>{children}</View>; }
function Line({ style, color }) { return <View style={[style, { borderColor: color, backgroundColor: style?.backgroundColor || 'transparent' }]} />; }

export function Icon({ name, size = 24, active, color }) {
  const c = tone(active, color);
  if (name === 'home') return <Home size={size} color={c} active={active} />;
  if (name === 'video') return <Video size={size} color={c} active={active} />;
  if (name === 'create') return <MigMark size={size} />;
  if (name === 'near') return <Pin size={size} color={c} active={active} />;
  if (name === 'collections') return <Collections size={size} color={c} active={active} />;
  if (name === 'profile') return <Profile size={size} color={c} active={active} />;
  if (name === 'comment') return <Comment size={size} color={c} active={active} />;
  if (name === 'mail') return <Envelope size={size} color={c} active={active} />;
  if (name === 'send') return <SendIcon size={size} color={c} active={active} />;
  if (name === 'share') return <ShareIcon size={size} color={c} active={active} />;
  if (name === 'save') return <Collections size={size} color={c} active={active} />;
  if (name === 'image') return <ImageIcon size={size} color={c} />;
  if (name === 'game') return <TextIcon text="✦" size={size} color={c} />;
  if (name === 'check') return <TextIcon text="✓" size={size} color={c} />;
  if (name === 'more') return <TextIcon text="•••" size={size} color={c} />;
  if (name === 'back') return <TextIcon text="‹" size={size + 6} color={c} />;
  if (name === 'close') return <TextIcon text="×" size={size} color={c} />;
  if (name === 'plus') return <TextIcon text="+" size={size} color={c} />;
  if (name === 'heartOn') return <Heart size={size} active />;
  if (name === 'heart') return <Heart size={size} color={c} active={active} />;
  return <TextIcon text={name} size={size} color={c} />;
}

function TextIcon({ text, size, color }) { return <Text style={{ fontSize: size, lineHeight: size + 4, color, fontWeight: '900' }}>{text}</Text>; }
function MigMark({ size }) { return <Fill size={size}><View style={s.migBubble}><View style={s.migEye} /><View style={s.migStar} /></View></Fill>; }
function Home({ size, color, active }) { return active ? <Fill size={size}><View style={s.homeA}><View style={s.homeDoor} /></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.roof} /><Line color={color} style={s.house} /></View>; }
function Video({ size, color, active }) { return active ? <Fill size={size}><View style={s.videoA}><View style={s.playWhite} /></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.videoBox} /><View style={[s.play, { borderLeftColor: color }]} /></View>; }
function Pin({ size, color, active }) { return active ? <Fill size={size}><View style={s.pinA}><View style={s.pinHole} /></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.pin} /><View style={[s.pinDot, { borderColor: color }]} /></View>; }
function Collections({ size, color, active }) { return active ? <Fill size={size}><View style={s.cardA}><Text style={s.cardHeart}>♥</Text></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.cardBack} /><Line color={color} style={s.cardFront} /><Text style={[s.cardSmallHeart, { color }]}>♡</Text></View>; }
function Profile({ size, color, active }) { return active ? <Fill size={size}><View style={s.personA}><View style={s.personHeadA} /></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.head} /><Line color={color} style={s.shoulders} /></View>; }
function Comment({ size, color, active }) { return active ? <Fill size={size}><View style={s.commentA}><Text style={s.dots}>•••</Text></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.bubble} /><Line color={color} style={s.tail} /></View>; }
function Heart({ size, color, active }) { return active ? <TextIcon text="♥" size={size} color={colors.hot} /> : <TextIcon text="♡" size={size} color={color} />; }
function ShareIcon({ size, color, active }) { return active ? <TextIcon text="➤" size={size} color={colors.hot} /> : <TextIcon text="✈" size={size} color={color} />; }
function SendIcon({ size, color }) { return <View style={[s.sendWrap, { width: size, height: size }]}><View style={[s.sendWing, { borderLeftColor: color }]} /><View style={[s.sendLine, { backgroundColor: color }]} /></View>; }
function Envelope({ size, color, active }) { return active ? <Fill size={size}><View style={s.mailA}><View style={s.mailFlapA} /></View></Fill> : <View style={[s.box, { width: size, height: size }]}><Line color={color} style={s.mailBox} /><View style={[s.mailVLeft, { backgroundColor: color }]} /><View style={[s.mailVRight, { backgroundColor: color }]} /></View>; }
function ImageIcon({ size, color }) { return <View style={[s.img, { width: size, height: size * .78, borderColor: color }]}><View style={[s.sun, { backgroundColor: color }]} /></View>; }
export function MailIcon({ active }) { return <View style={[s.mailButton, active && s.mailButtonActive]}><Envelope size={25} color={active ? colors.white : colors.ink} active={active} /></View>; }

const s = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  fill: { alignItems: 'center', justifyContent: 'center' },
  roof: { position: 'absolute', top: 4, width: 16, height: 16, borderLeftWidth: 2.2, borderTopWidth: 2.2, transform: [{ rotate: '45deg' }] },
  house: { position: 'absolute', bottom: 3, width: 18, height: 13, borderWidth: 2.2, borderTopWidth: 0, borderRadius: 4 },
  homeA: { width: 22, height: 20, borderRadius: 7, backgroundColor: colors.hot, transform: [{ rotate: '45deg' }] },
  homeDoor: { position: 'absolute', right: 1, bottom: 6, width: 8, height: 9, borderRadius: 2, backgroundColor: colors.white },
  videoBox: { width: 22, height: 17, borderWidth: 2.2, borderRadius: 6 },
  play: { position: 'absolute', borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8, borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  videoA: { width: 23, height: 19, borderRadius: 6, backgroundColor: colors.hot },
  playWhite: { marginLeft: 9, marginTop: 5, borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8, borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: colors.white },
  migBubble: { width: 31, height: 27, borderRadius: 13, backgroundColor: colors.hot },
  migEye: { position: 'absolute', width: 13, height: 13, borderRadius: 7, backgroundColor: colors.white, left: 8, top: 7 },
  migStar: { position: 'absolute', right: -2, top: -4, width: 8, height: 8, backgroundColor: colors.peach, transform: [{ rotate: '45deg' }] },
  pin: { width: 20, height: 20, borderRadius: 11, borderWidth: 2.2, transform: [{ rotate: '45deg' }] },
  pinDot: { position: 'absolute', top: 7, width: 7, height: 7, borderRadius: 4, borderWidth: 2 },
  pinA: { width: 22, height: 22, borderRadius: 12, backgroundColor: colors.hot, transform: [{ rotate: '45deg' }] },
  pinHole: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.white, margin: 7 },
  cardBack: { position: 'absolute', width: 20, height: 17, borderWidth: 2, borderRadius: 5, top: 4, left: 5 },
  cardFront: { width: 20, height: 17, borderWidth: 2, borderRadius: 5 },
  cardA: { width: 23, height: 20, borderRadius: 6, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  cardHeart: { color: colors.white, fontSize: 14, lineHeight: 16 }, cardSmallHeart: { fontSize: 12, marginTop: 1 },
  head: { width: 10, height: 10, borderRadius: 6, borderWidth: 2.2, marginTop: 2 },
  shoulders: { width: 22, height: 11, borderTopWidth: 2.2, borderLeftWidth: 2.2, borderRightWidth: 2.2, borderRadius: 13, marginTop: 3 },
  personA: { width: 24, height: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: colors.hot, marginTop: 9 },
  personHeadA: { position: 'absolute', top: -11, left: 7, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.hot },
  bubble: { width: 24, height: 18, borderRadius: 10, borderWidth: 2.2 },
  tail: { position: 'absolute', left: 5, bottom: 3, width: 8, height: 8, borderLeftWidth: 2.2, borderBottomWidth: 2.2, transform: [{ rotate: '-22deg' }] },
  commentA: { width: 27, height: 20, borderRadius: 10, backgroundColor: colors.hot },
  dots: { color: colors.white, fontSize: 15, lineHeight: 18, textAlign: 'center' },
  sendWrap: { alignItems: 'center', justifyContent: 'center' },
  sendWing: { borderTopWidth: 8, borderBottomWidth: 8, borderLeftWidth: 18, borderTopColor: 'transparent', borderBottomColor: 'transparent', transform: [{ rotate: '-7deg' }] },
  sendLine: { position: 'absolute', width: 11, height: 2.2, borderRadius: 2, transform: [{ rotate: '-18deg' }], left: 3, top: 13 },
  mailBox: { width: 24, height: 18, borderRadius: 6, borderWidth: 2.2 },
  mailVLeft: { position: 'absolute', width: 13, height: 2.2, borderRadius: 2, left: 5, top: 11, transform: [{ rotate: '34deg' }] },
  mailVRight: { position: 'absolute', width: 13, height: 2.2, borderRadius: 2, right: 5, top: 11, transform: [{ rotate: '-34deg' }] },
  mailA: { width: 25, height: 19, borderRadius: 7, backgroundColor: colors.hot, overflow: 'hidden' },
  mailFlapA: { position: 'absolute', left: 5, top: 5, width: 15, height: 15, borderLeftWidth: 2.4, borderBottomWidth: 2.4, borderColor: colors.white, transform: [{ rotate: '-45deg' }] },
  img: { borderWidth: 2, borderRadius: 5 }, sun: { width: 5, height: 5, borderRadius: 3, margin: 3 },
  mailButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  mailButtonActive: { backgroundColor: colors.hot }
});
