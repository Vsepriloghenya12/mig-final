import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { chatApi } from './api/chat';
import { BottomNav } from './components/BottomNav';
import { UserSearchSheet } from './components/UserSearchSheet';
import { useIdentity } from './hooks/useIdentity';
import { useMigData } from './hooks/useMigData';
import { usePushNotifications } from './hooks/usePushNotifications';
import { CreateScreen } from './screens/CreateScreen';
import { FeedScreen } from './screens/FeedScreen';
import { RegistrationScreen } from './screens/auth/RegistrationScreen';
import { NearbyScreen } from './screens/NearbyScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { UserProfileScreen } from './screens/UserProfileScreen';
import { VideoScreen } from './screens/VideoScreen';
import { ChatScreen } from './screens/messages/ChatScreen';
import { MessagesScreen } from './screens/messages/MessagesScreen';
import { colors } from './theme';
import { ThemeProvider, useTheme } from './theme-context';

function AppShell() {
  const { palette, isDark } = useTheme();
  const { identity, ready, save, clear } = useIdentity();
  const { api, data, setData, loading, error, reload } = useMigData(identity?.id);
  usePushNotifications(api, identity?.id);
  const [active, setActive] = useState('feed');
  const [chat, setChat] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [navHidden, setNavHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!identity?.id || !api) return;
    try {
      const result = await chatApi.dialogs(api);
      const total = (result.dialogs || []).reduce((sum, dialog) => sum + Number(dialog.unread || dialog.unreadCount || 0), 0);
      setUnreadCount(total);
    } catch (e) {
      // no-op: unread indicator is optional and must never break the app
    }
  }, [api, identity?.id]);

  useEffect(() => {
    if (!identity?.id) { setUnreadCount(0); return undefined; }
    refreshUnread();
    const timer = setInterval(refreshUnread, 10000);
    return () => clearInterval(timer);
  }, [identity?.id, refreshUnread]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!identity) return false;
      if (active === 'chat') { setActive('messages'); refreshUnread(); return true; }
      if (active === 'userProfile') { setProfileUser(null); setActive('feed'); return true; }
      if (active !== 'feed') { setActive('feed'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [active, identity, refreshUnread]);

  if (!ready) return <SafeAreaProvider><Center text="Открываем Близз..." /></SafeAreaProvider>;
  if (!identity) return <SafeAreaProvider><RegistrationScreen onSave={save} /></SafeAreaProvider>;
  if (!data && loading) return <SafeAreaProvider><Center text="Загружаем Близз..." /></SafeAreaProvider>;
  if (!data && error) return <SafeAreaProvider><Center text={error} /></SafeAreaProvider>;

  const handleLogout = async () => {
    setNavHidden(false);
    setChat(null);
    setProfileUser(null);
    setActive('feed');
    setSearchOpen(false);
    setUnreadCount(0);
    setData(null);
    await clear();
  };

  const openChat = (id, user) => { setSearchOpen(false); setChat({ id, user }); setActive('chat'); };
  const openUser = (user) => {
    if (!user?.id || user.id === identity.id) return;
    setSearchOpen(false);
    setProfileUser(user);
    setActive('userProfile');
  };
  const openTab = (next) => {
    setNavHidden(false);
    if (next !== 'userProfile') setProfileUser(null);
    if (next !== 'chat') setChat((current) => next === 'messages' ? current : null);
    if (next === 'messages') refreshUnread();
    setActive(next);
  };

  const common = { data, setData, api, loading, reload, setActive: openTab, setNavHidden, currentUserId: identity.id, openChat, onOpenProfile: openUser, hasUnreadMessages: unreadCount > 0, unreadMessagesCount: unreadCount };

  let body;
  if (active === 'messages') body = <MessagesScreen {...common} openChat={openChat} onOpenProfile={openUser} onUnreadChange={setUnreadCount} />;
  else if (active === 'chat') body = <ChatScreen api={api} dialogId={chat?.id} user={chat?.user} currentUserId={identity.id} onBack={() => { setActive('messages'); refreshUnread(); }} onOpenProfile={openUser} />;
  else if (active === 'userProfile') body = <UserProfileScreen {...common} user={profileUser} onBack={() => setActive('feed')} openChat={openChat} />;
  else {
    let screen = <FeedScreen {...common} onSearch={() => setSearchOpen(true)} />;
    if (active === 'video') screen = <VideoScreen {...common} />;
    if (active === 'create') screen = <CreateScreen {...common} initial="story" />;
    if (active === 'createStory') screen = <CreateScreen {...common} initial="story" />;
    if (active === 'createVideo') screen = <CreateScreen {...common} initial="video" />;
    if (active === 'createPlace') screen = <CreateScreen {...common} initial="place" />;
    if (active === 'nearby') screen = <NearbyScreen {...common} />;
    if (active === 'profile') screen = <ProfileScreen {...common} onLogout={handleLogout} />;
    body = <View style={[styles.app, { backgroundColor: palette.bg }]}>{screen}<BottomNav active={baseTab(active)} setActive={openTab} hidden={navHidden} /></View>;
  }

  return (
    <SafeAreaProvider>
      <StatusBar translucent={false} backgroundColor={isDark ? '#101326' : palette.bg} barStyle={isDark ? 'light-content' : 'dark-content'} />
      {body}
      <UserSearchSheet visible={searchOpen} users={data?.users || []} currentUserId={identity.id} api={api} onClose={() => setSearchOpen(false)} onOpenProfile={openUser} onOpenChat={openChat} />
      <PortalHost />
    </SafeAreaProvider>
  );
}

function baseTab(active) { return active.startsWith('create') ? 'create' : active; }
function Center({ text }) { const { palette } = useTheme(); return <View style={[styles.center, { backgroundColor: palette.bg }]}><ActivityIndicator color={colors.hot} /><Text style={[styles.centerText, { color: palette.ink }]}>{text}</Text></View>; }
export default function App() { return <ThemeProvider><AppShell /></ThemeProvider>; }

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  centerText: { color: colors.ink, fontWeight: '900', marginTop: 12, textAlign: 'center' }
});
