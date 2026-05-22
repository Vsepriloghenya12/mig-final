import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { BottomNav } from './components/BottomNav';
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

export default function App() {
  const { identity, ready, save, clear } = useIdentity();
  const { api, data, loading, error, reload } = useMigData(identity?.id);
  usePushNotifications(api, identity?.id);
  const [active, setActive] = useState('feed');
  const [chat, setChat] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  if (!ready) return <Center text="Открываем Миг..." />;
  if (!identity) return <LoginScreen onSave={save} />;
  if (!data && loading) return <Center text="Загружаем Миг..." />;
  if (!data && error) return <Center text={error} />;
  const openChat = (id, user) => { setChat({ id, user }); setActive('chat'); };
  const openUser = (user) => { if (user?.id && user.id !== identity.id) { setProfileUser(user); setActive('userProfile'); } };
  const common = { data, api, loading, reload, setActive, currentUserId: identity.id };
  if (active === 'messages') return <MessagesScreen {...common} openChat={openChat} />;
  if (active === 'chat') return <ChatScreen api={api} dialogId={chat?.id} user={chat?.user} currentUserId={identity.id} onBack={() => setActive('messages')} />;
  if (active === 'userProfile') return <UserProfileScreen {...common} user={profileUser} onBack={() => setActive('feed')} openChat={openChat} />;
  let screen = <FeedScreen {...common} onOpenProfile={openUser} />;
  if (active === 'video') screen = <VideoScreen {...common} />;
  if (active === 'create') screen = <CreateScreen {...common} initial="post" />;
  if (active === 'createStory') screen = <CreateScreen {...common} initial="story" />;
  if (active === 'createVideo') screen = <CreateScreen {...common} initial="video" />;
  if (active === 'createPlace') screen = <CreateScreen {...common} initial="place" />;
  if (active === 'nearby') screen = <NearbyScreen {...common} />;
  if (active === 'profile') screen = <ProfileScreen {...common} onLogout={clear} />;
  return <View style={styles.app}>{screen}<BottomNav active={baseTab(active)} setActive={setActive} /></View>;
}
function baseTab(active) { return active.startsWith('create') ? 'create' : active; }
function Center({ text }) { return <View style={styles.center}><ActivityIndicator color={colors.hot} /><Text style={styles.centerText}>{text}</Text></View>; }
const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, padding: 24 },
  centerText: { color: colors.ink, fontWeight: '900', marginTop: 12, textAlign: 'center' }
});
