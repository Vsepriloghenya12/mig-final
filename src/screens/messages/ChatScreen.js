import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, FlatList, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { chatApi } from '../../api/chat';
import { assets } from '../../assets';
import { POLL_MS } from '../../config';
import { ChatBubble } from '../../components/chat/ChatBubble';
import { Avatar } from '../../components/ui/Avatar';
import { ActionSheet, ActionSheetItem } from '../../components/ui/action-sheet';
import { Icon } from '../../components/ui/MigIcon';
import { Text } from '../../components/ui/text';
import { useTheme } from '../../theme-context';
import { colors } from '../../theme';
import { pickAndUpload } from '../../utils/picker';
import { blockUser, reportContent } from '../../utils/moderation';

export function ChatScreen({ api, dialogId, user, currentUserId, onBack, onOpenProfile }) {
  const [messages, setMessages] = useState([]);
  const { palette, isDark } = useTheme();
  const [text, setText] = useState('');
  const [attachMenu, setAttachMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const listRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    if (!dialogId || appState.current !== 'active') return;
    setMessages((await chatApi.messages(api, dialogId)).messages || []);
  }, [api, dialogId]);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_MS);
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current !== 'active';
      appState.current = nextState;
      if (wasInactive && nextState === 'active') load();
    });
    return () => { clearInterval(timer); subscription.remove(); };
  }, [load]);

  const scrollToEnd = () => requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  const send = async () => {
    if (!text.trim()) return;
    await chatApi.sendText(api, dialogId, text.trim());
    setText('');
    await load();
    scrollToEnd();
  };
  const media = async (kind) => {
    setAttachMenu(false);
    const file = await pickAndUpload(api, kind);
    if (file) {
      await chatApi.sendMedia(api, dialogId, file);
      await load();
      scrollToEnd();
    }
  };
  const game = async (kind) => {
    setAttachMenu(false);
    await chatApi.startGame(api, dialogId, kind);
    await load();
    scrollToEnd();
  };
  const onGame = useCallback(async (action, id, choice) => {
    try {
      if (action === 'accept') await chatApi.acceptGame(api, id);
      if (action === 'decline') await chatApi.declineGame(api, id);
      if (action === 'move') await chatApi.moveGame(api, id, choice);
      await load();
    } catch (e) { Alert.alert('Игра', e.message); }
  }, [api, load]);
  const reportMessage = useCallback((msg) => reportContent(api, { targetType: 'message', targetId: msg.id, targetUserId: msg.userId }), [api]);
  const reportProfile = () => { setProfileMenu(false); reportContent(api, { targetType: 'profile', targetId: user?.id, targetUserId: user?.id }); };
  const blockProfile = () => { setProfileMenu(false); blockUser(api, user?.id, onBack); };
  const renderMessage = useCallback(({ item }) => <ChatBubble message={item} currentUserId={currentUserId} onGame={onGame} onReport={reportMessage} />, [currentUserId, onGame, reportMessage]);
  const openProfile = () => { if (!user?.isGroup && user?.id) onOpenProfile?.(user); };

  return (
    <KeyboardAvoidingView style={[styles.wrap, { backgroundColor: palette.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <View style={[styles.head, { paddingTop: insets.top + 8, minHeight: insets.top + 76, backgroundColor: palette.bg, borderColor: palette.line }]}> 
        <Pressable onPress={onBack} style={[styles.headBtn, { backgroundColor: palette.surface }]} accessibilityRole="button" accessibilityLabel="Назад">
          <Icon name="back" size={25} color={palette.ink} />
        </Pressable>
        <Pressable onPress={openProfile} disabled={!!user?.isGroup} style={styles.headUser} accessibilityRole="button" accessibilityLabel="Открыть профиль собеседника">
          {user?.isGroup ? <GroupAvatar users={user.users || []} /> : <Avatar user={user} size={44} />}
          <View style={styles.headTitleBox}>
            <Text numberOfLines={1} style={[styles.headTitle, { color: palette.ink }]}>{user?.name || 'Диалог'}</Text>
            <Text numberOfLines={1} style={[styles.headSubtitle, { color: palette.muted }]}>{user?.isGroup ? user.handle : (user?.handle || 'в Близз')}</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setProfileMenu(true)} style={[styles.headBtn, { backgroundColor: palette.surface }]} accessibilityRole="button" accessibilityLabel="Действия с диалогом">
          <Icon name="more" size={20} color={palette.ink} />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMessage}
        contentContainerStyle={[styles.list, { paddingBottom: 18 }]}
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={16}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 8), backgroundColor: palette.bg, borderColor: palette.line }]}> 
        <Pressable onPress={() => setAttachMenu(true)} style={styles.attachBtn} accessibilityRole="button" accessibilityLabel="Прикрепить">
          <Icon name="plus" color={colors.white} size={23} />
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Сообщение"
          placeholderTextColor={palette.muted}
          style={[styles.input, { color: palette.ink, backgroundColor: isDark ? '#14141C' : '#F4F2FA', borderColor: palette.line }]}
          accessibilityLabel="Сообщение"
          returnKeyType="send"
          onSubmitEditing={send}
        />
        <Pressable onPress={send} disabled={!text.trim()} style={({ pressed }) => [styles.sendBtn, !text.trim() && styles.sendBtnDisabled, pressed && text.trim() && { transform: [{ scale: 0.96 }] }]} accessibilityRole="button" accessibilityState={{ disabled: !text.trim() }} accessibilityLabel="Отправить">
          <Image source={assets.chatSend} style={styles.sendIcon} resizeMode="contain" />
        </Pressable>
      </View>

      <ActionSheet visible={attachMenu} title="Вложение" description="Добавьте медиа или начните игру" onClose={() => setAttachMenu(false)}>
        <ActionSheetItem label="Фото" description="Отправить изображение" onPress={() => media('image')} />
        <ActionSheetItem label="Видео" description="Отправить короткое видео" onPress={() => media('video')} />
        <ActionSheetItem label="Напёрстки" description="Начать игру в чате" onPress={() => game('cups')} />
        <ActionSheetItem label="Три карты" description="Начать игру в чате" onPress={() => game('cards')} />
        <ActionSheetItem label="Футбол" description="Начать игру в чате" onPress={() => game('football')} />
      </ActionSheet>

      <ActionSheet visible={profileMenu} title={user?.name || 'Профиль'} description="Действия с пользователем" onClose={() => setProfileMenu(false)}>
        <ActionSheetItem label="Пожаловаться" description="Отправить профиль на проверку" onPress={reportProfile} />
        <ActionSheetItem label="Заблокировать" description="Скрыть пользователя и выйти из чата" tone="destructive" onPress={blockProfile} />
      </ActionSheet>
    </KeyboardAvoidingView>
  );
}

function GroupAvatar({ users = [] }) {
  const list = users.slice(0, 3);
  return (
    <View style={styles.groupAvatarWrap}>
      {list.map((u, i) => (
        <View key={u.id || i} style={[styles.groupAvatarItem, { left: i * 12, zIndex: 4 - i }]}><Avatar user={u} size={34} /></View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg },
  head: { paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderColor: colors.line },
  headBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.faint, alignItems: 'center', justifyContent: 'center' },
  headUser: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11, minWidth: 0 },
  groupAvatarWrap: { width: 62, height: 42, position: 'relative' },
  groupAvatarItem: { position: 'absolute', top: 4, borderRadius: 18, borderWidth: 2, borderColor: colors.white, overflow: 'hidden' },
  headTitleBox: { flex: 1, minWidth: 0 },
  headTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  headSubtitle: { color: colors.muted, fontSize: 12, fontWeight: '800', marginTop: 2 },
  list: { paddingHorizontal: 12, paddingTop: 14 },
  inputBar: { borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingTop: 8 },
  attachBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.hot },
  input: { flex: 1, minHeight: 44, borderRadius: 22, borderWidth: 1, color: colors.ink, fontSize: 15, fontWeight: '700', paddingHorizontal: 16 },
  sendBtn: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.42 },
  sendIcon: { width: 54, height: 54 },
});
