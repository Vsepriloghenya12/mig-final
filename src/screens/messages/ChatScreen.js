import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { chatApi } from '../../api/chat';
import { POLL_MS } from '../../config';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { Avatar } from '../../components/ui/Avatar';
import { Icon } from '../../components/ui/Icon';
import { colors, topInset } from '../../theme';
import { pickAndUpload } from '../../utils/picker';
import { blockUser, reportContent } from '../../utils/moderation';

export function ChatScreen({ api, dialogId, user, currentUserId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [menu, setMenu] = useState(false);
  const scroll = useRef(null);
  const load = async () => setMessages((await chatApi.messages(api, dialogId)).messages || []);
  useEffect(() => { load(); const t = setInterval(load, POLL_MS); return () => clearInterval(t); }, [dialogId]);
  const send = async () => { if (!text.trim()) return; await chatApi.sendText(api, dialogId, text.trim()); setText(''); await load(); };
  const media = async (kind) => { setMenu(false); const file = await pickAndUpload(api, kind); if (file) { await chatApi.sendMedia(api, dialogId, file); await load(); } };
  const game = async (kind) => { setMenu(false); await chatApi.startGame(api, dialogId, kind); await load(); };
  const onGame = async (action, id, choice) => { try { if (action === 'accept') await chatApi.acceptGame(api, id); if (action === 'decline') await chatApi.declineGame(api, id); if (action === 'move') await chatApi.moveGame(api, id, choice); await load(); } catch (e) { Alert.alert('Игра', e.message); } };
  const reportMessage = (msg) => reportContent(api, { targetType: 'message', targetId: msg.id, targetUserId: msg.userId });
  return <View style={styles.wrap}><View style={styles.head}><Pressable onPress={onBack}><Icon name="back" size={34} /></Pressable><Avatar user={user} size={42} /><Text style={styles.title}>{user?.name || 'Диалог'}</Text><View style={{ flex: 1 }} /><Pressable onPress={() => reportContent(api, { targetType: 'profile', targetId: user?.id, targetUserId: user?.id })}><Text style={styles.headBtn}>!</Text></Pressable><Pressable onPress={() => blockUser(api, user?.id, onBack)}><Text style={styles.headBtn}>Блок</Text></Pressable></View>
    <ScrollView ref={scroll} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })} contentContainerStyle={styles.list}>{messages.map((m) => <ChatBubble key={m.id} message={m} currentUserId={currentUserId} onGame={onGame} onReport={reportMessage} />)}</ScrollView>
    <View style={styles.inputRow}><Pressable onPress={() => setMenu(true)} style={styles.plus}><Icon name="plus" color={colors.white} /></Pressable><TextInput value={text} onChangeText={setText} placeholder="Сообщение" placeholderTextColor={colors.muted} style={styles.input} /><Pressable onPress={send} style={styles.send}><Icon name="send" color={colors.white} size={18} /></Pressable></View>
    <AttachMenu visible={menu} onClose={() => setMenu(false)} onPhoto={() => media('image')} onVideo={() => media('video')} onGame={game} />
  </View>;
}

function AttachMenu({ visible, onClose, onPhoto, onVideo, onGame }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><Pressable style={styles.backdrop} onPress={onClose} /><View style={styles.menu}><MenuItem label="Фото" onPress={onPhoto} /><MenuItem label="Видео" onPress={onVideo} /><Text style={styles.gameTitle}>Начать игру</Text><MenuItem label="Напёрстки" onPress={() => onGame('cups')} /><MenuItem label="Три карты" onPress={() => onGame('cards')} /><MenuItem label="Футбол" onPress={() => onGame('football')} /></View></Modal>;
}
function MenuItem({ label, onPress }) { return <Pressable onPress={onPress} style={styles.menuItem}><Text style={styles.menuText}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { paddingTop: topInset + 8, paddingHorizontal: 14, height: topInset + 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderColor: colors.line },
  title: { color: colors.ink, fontSize: 20, fontWeight: '900' },
  headBtn: { color: colors.hot, fontSize: 12, fontWeight: '900' },
  list: { padding: 14, paddingBottom: 98 },
  inputRow: { position: 'absolute', left: 12, right: 12, bottom: 14, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.white, borderRadius: 28, borderWidth: 1, borderColor: colors.line, padding: 6 },
  plus: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.hot, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, minHeight: 42, color: colors.ink, fontSize: 15 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,.2)' },
  menu: { position: 'absolute', left: 16, right: 16, bottom: 82, backgroundColor: colors.white, borderRadius: 26, padding: 12 },
  menuItem: { padding: 14, borderBottomWidth: 1, borderColor: colors.line },
  menuText: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  gameTitle: { color: colors.hot, fontWeight: '900', paddingHorizontal: 14, paddingTop: 10 }
});
