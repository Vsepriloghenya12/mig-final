import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PortalHost } from '@rn-primitives/portal';
import { BottomNav } from './components/BottomNav';
import { UserSearchSheet } from './components/UserSearchSheet';
import { useIdentity } from './hooks/useIdentity';
import { useMigData } from './hooks/useMigData';
import { usePushNotifications } from './hooks/usePushNotifications';
import { CreateScreen } from './screens/CreateScreen';
import { FeedScreen } from './screens/FeedScreen';
import { LoginScreen } from './screens/LoginScreen';
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

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!identity) return false;
      if (active === 'chat') { setActive('messages'); return true; }
      if (active === 'userProfile') { setProfileUser(null); setActive('feed'); return true; }
      if (active !== 'feed') { setActive('feed'); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [active, identity]);

  if (!ready) return <SafeAreaProvider><Center text="Открываем Близз..." /></SafeAreaProvider>;
  if (!identity) return <SafeAreaProvider><LoginScreen onSave={save} /></SafeAreaProvider>;
  if (!data && loading) return <SafeAreaProvider><Center text="Загружаем Близз..." /></SafeAreaProvider>;
  if (!data && error) return <SafeAreaProvider><Center text={error} /></SafeAreaProvider>;

  const handleLogout = async () => {
    setNavHidden(false);
    setChat(null);
    setProfileUser(null);
    setActive('feed');
    setSearchOpen(false);
    setData(null);
    await clear();
  };

  const openChat = (id, user) => { setSearchOpen(false); setChat({ id, user }); setActive('chat'); };
  const openUser = (user) => { if (user?.id && user.id !== identity.id) { setSearchOpen(false); setProfileUser(user); setActive('userProfile'); } };
  const openTab = (next) => {
    setNavHidden(false);
    if (next !== 'userProfile') setProfileUser(null);
    if (next !== 'chat') setChat((current) => next === 'messages' ? current : null);
    setActive(next);
  };
  const common = { data, setData, api, loading, reload, setActive: openTab, setNavHidden, currentUserId: identity.id, openChat };

  let body;
  if (active === 'messages') body = <MessagesScreen {...common} openChat={openChat} />;
  else if (active === 'chat') body = <ChatScreen api={api} dialogId={chat?.id} user={chat?.user} currentUserId={identity.id} onBack={() => setActive('messages')} />;
  else if (active === 'userProfile') body = <UserProfileScreen {...common} user={profileUser} onBack={() => setActive('feed')} openChat={openChat} />;
  else {
    let screen = <FeedScreen {...common} onOpenProfile={openUser} onSearch={() => setSearchOpen(true)} />;
    if (active === 'video') screen = <VideoScreen {...common} onOpenProfile={openUser} />;
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
      <StatusBar translucent={false} backgroundColor={isDark ? '#14141A' : palette.bg} barStyle={isDark ? 'light-content' : 'dark-content'} />
      {body}
      <UserSearchSheet visible={searchOpen} users={data?.users || []} currentUserId={identity.id} api={api} onClose={() => setSearchOpen(false)} onOpenProfile={openUser} onOpenChat={openChat} />
      <PortalHost />
    </SafeAreaProvider>
  );
}
function baseTab(active) { return active.startsWith('create') ? 'create' : active; }
function Center({ text }) { const { palette } = useTheme(); return <View style={[styles.center, { backgroundColor: palette.bg }]}><ActivityIndicator color={colors.hot} /><Text style={[styles.centerText, { color: palette.ink }]}>{text}</Text></View>; }
export default function App() {
  return <ThemeProvider><AppShell /></ThemeProvider>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  centerText: { color: colors.ink, fontWeight: '900', marginTop: 12, textAlign: 'center' }
});
