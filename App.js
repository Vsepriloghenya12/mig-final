import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

const { width } = Dimensions.get('window');
const TOP = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 8;
const CONTENT_BOTTOM = 112;
const USER_ID = 'ivan';
const DEFAULT_API_URL = ''; // После деплоя можно заменить на Railway URL: https://your-app.up.railway.app

const colors = {
  bg: '#FBFAFF',
  card: '#FFFFFF',
  ink: '#15142D',
  text: '#24213C',
  muted: '#77728D',
  faint: '#F1EFFA',
  line: '#E8E5F2',
  pink: '#F22D8F',
  hotPink: '#FF2D8F',
  violet: '#7B5CFF',
  blue: '#2F7BFF',
  coral: '#FF6B6B',
  peach: '#FFB27A',
  black: '#050510',
  white: '#FFFFFF'
};

const assets = {
  mark: require('./assets/brand/mark.png'),
  lake: require('./assets/ref/lake.jpg'),
  dancer: require('./assets/ref/dancer.jpg'),
  boat: require('./assets/ref/boat.jpg'),
  map: require('./assets/ref/map.jpg'),
  cafe: require('./assets/ref/cafe.jpg'),
  city: require('./assets/ref/city.jpg'),
  street: require('./assets/ref/street.jpg'),
  nightCity: require('./assets/ref/night-city.jpg'),
  tower: require('./assets/ref/tower.jpg'),
  street2: require('./assets/ref/street2.jpg'),
  architecture: require('./assets/ref/architecture.jpg'),
  flowers: require('./assets/ref/flowers.jpg'),
  river: require('./assets/ref/river.jpg'),
  avatar: require('./assets/ref/profile-avatar.jpg'),
  person1: require('./assets/ref/person-1.jpg'),
  person2: require('./assets/ref/person-2.jpg'),
  person3: require('./assets/ref/person-3.jpg'),
  collectionCafe: require('./assets/ref/collection-cafe.jpg'),
  collectionStyle: require('./assets/ref/collection-style.jpg'),
  collectionNight: require('./assets/ref/collection-night.jpg'),
  collectionWeekend: require('./assets/ref/collection-weekend.jpg')
};

const imageByKey = {
  mark: assets.mark,
  lake: assets.lake,
  dancer: assets.dancer,
  boat: assets.boat,
  map: assets.map,
  cafe: assets.cafe,
  city: assets.city,
  street: assets.street,
  nightCity: assets.nightCity,
  tower: assets.tower,
  street2: assets.street2,
  architecture: assets.architecture,
  flowers: assets.flowers,
  river: assets.river,
  avatar: assets.avatar,
  person1: assets.person1,
  person2: assets.person2,
  person3: assets.person3,
  collectionCafe: assets.collectionCafe,
  collectionStyle: assets.collectionStyle,
  collectionNight: assets.collectionNight,
  collectionWeekend: assets.collectionWeekend
};

const createImages = [
  { key: 'lake', title: 'Озеро' },
  { key: 'cafe', title: 'Кафе' },
  { key: 'city', title: 'Город' },
  { key: 'flowers', title: 'Цветы' },
  { key: 'street', title: 'Улица' },
  { key: 'river', title: 'Река' }
];

function src(key) {
  return imageByKey[key] || imageByKey.lake;
}

function normalizeUrl(value) {
  return String(value || '').trim().replace(/\/$/, '');
}

async function request(apiBaseUrl, path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }
  return data;
}

export default function App() {
  const [active, setActive] = useState('feed');
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_URL);
  const [apiInput, setApiInput] = useState(DEFAULT_API_URL);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const api = useMemo(() => ({
    baseUrl: apiBaseUrl,
    async get(path) {
      return request(apiBaseUrl, path);
    },
    async post(path, body) {
      return request(apiBaseUrl, path, { method: 'POST', body: JSON.stringify(body || {}) });
    }
  }), [apiBaseUrl]);

  const flash = useCallback((text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 1700);
  }, []);

  const load = useCallback(async (nextUrl) => {
    const url = normalizeUrl(nextUrl || apiBaseUrl);
    if (!url) {
      setError('Введите адрес backend');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await request(url, `/api/bootstrap?userId=${encodeURIComponent(USER_ID)}`);
      setApiBaseUrl(url);
      setApiInput(url);
      setData(result);
      setSettingsOpen(false);
    } catch (err) {
      setError(err.message || 'Не удалось подключиться к серверу');
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    if (apiBaseUrl) load(apiBaseUrl);
  }, []);

  const updateData = useCallback((patch) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);

  const reload = useCallback(() => load(apiBaseUrl), [apiBaseUrl, load]);
  const dark = active === 'video' || active === 'create';

  if (!data && !loading) {
    return <ConnectScreen apiInput={apiInput} setApiInput={setApiInput} onConnect={() => load(apiInput)} error={error} />;
  }

  const common = { data, api, reload, updateData, flash, setActive };
  let screen = <FeedScreen {...common} />;
  if (active === 'video') screen = <VideoScreen {...common} />;
  if (active === 'create') screen = <CreateScreen {...common} />;
  if (active === 'nearby') screen = <NearbyScreen {...common} />;
  if (active === 'profile') screen = <ProfileScreen {...common} />;
  if (active === 'collections') screen = <CollectionsScreen {...common} />;

  return (
    <View style={[styles.app, dark && styles.darkApp]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={dark ? 'light-content' : 'dark-content'} />
      {dark ? null : <BackgroundBlobs />}
      {loading && !data ? <LoadingScreen /> : screen}
      <BottomNav active={active === 'collections' ? 'profile' : active} setActive={setActive} dark={dark} />
      {notice ? <Toast text={notice} /> : null}
      <SettingsModal
        visible={settingsOpen}
        apiInput={apiInput}
        setApiInput={setApiInput}
        onClose={() => setSettingsOpen(false)}
        onConnect={() => load(apiInput)}
        loading={loading}
        error={error}
      />
      <FloatingServerButton onPress={() => setSettingsOpen(true)} dark={dark} />
    </View>
  );
}

function ConnectScreen({ apiInput, setApiInput, onConnect, error }) {
  return (
    <View style={styles.app}>
      <BackgroundBlobs />
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <SafeAreaView style={styles.connectSafe}>
        <Image source={assets.mark} style={styles.connectLogo} />
        <Text style={styles.connectTitle}>Миг</Text>
        <Text style={styles.connectText}>Подключите приложение к Railway backend. Введите адрес вида https://your-app.up.railway.app — после этого лента, профиль, лайки, комментарии, подборки и места будут работать через сервер.</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputLabel}>Адрес backend</Text>
          <TextInput
            value={apiInput}
            onChangeText={setApiInput}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="https://your-app.up.railway.app"
            placeholderTextColor="#A7A1BA"
            style={styles.textInput}
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable style={styles.primaryButton} onPress={onConnect}>
          <Text style={styles.primaryButtonText}>Подключиться</Text>
        </Pressable>
        <Text style={styles.connectHint}>Для локального теста можно ввести LAN-адрес компьютера. Для рабочей APK используйте Railway URL без /api в конце.</Text>
      </SafeAreaView>
    </View>
  );
}

function LoadingScreen() {
  return <View style={styles.loading}><ActivityIndicator size="large" color={colors.hotPink} /></View>;
}

function BackgroundBlobs() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blob, styles.blobPink]} />
      <View style={[styles.blob, styles.blobBlue]} />
      <View style={[styles.blob, styles.blobPeach]} />
    </View>
  );
}

function Screen({ children }) {
  return <SafeAreaView style={styles.screen}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>{children}</ScrollView></SafeAreaView>;
}

function Header({ title = 'Миг', subtitle, right, onRefresh, back, onBack }) {
  return (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        {back ? (
          <Pressable onPress={onBack} style={styles.circleButton}><Text style={styles.backText}>‹</Text></Pressable>
        ) : (
          <Image source={assets.mark} style={styles.logoMark} />
        )}
        <View>
          <Text style={styles.logoText}>{title}</Text>
          {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {right ? <Pressable onPress={onRefresh} style={styles.circleButton}><Text style={styles.circleButtonText}>↻</Text></Pressable> : null}
    </View>
  );
}

function CircleButton({ label, light, onPress }) {
  return <Pressable onPress={onPress} style={[styles.circleButton, light && styles.circleButtonLight]}><Text style={[styles.circleButtonText, light && styles.circleButtonTextLight]}>{label}</Text></Pressable>;
}

function FeedScreen({ data, api, reload, updateData, flash }) {
  const [commentPost, setCommentPost] = useState(null);

  const likePost = async (postId) => {
    try {
      const result = await api.post(`/api/posts/${postId}/like`, { userId: USER_ID });
      updateData({ posts: result.posts, currentUser: result.currentUser });
    } catch (err) {
      flash(err.message);
    }
  };

  const savePost = async (postId) => {
    try {
      const result = await api.post(`/api/posts/${postId}/save`, { userId: USER_ID });
      updateData({ posts: result.posts, currentUser: result.currentUser, collections: result.collections });
      flash(result.saved ? 'Сохранено' : 'Удалено из сохранённых');
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <Screen>
      <Header onRefresh={reload} right />
      <Text style={styles.sectionTitle}>Миги</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesRow}>
        {data.stories.map((story) => <Story key={story.id} story={story} />)}
      </ScrollView>
      {data.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={() => likePost(post.id)}
          onSave={() => savePost(post.id)}
          onComment={() => setCommentPost(post)}
        />
      ))}
      <CommentModal
        visible={Boolean(commentPost)}
        post={commentPost}
        onClose={() => setCommentPost(null)}
        api={api}
        updateData={updateData}
        flash={flash}
      />
    </Screen>
  );
}

function Story({ story }) {
  return (
    <View style={styles.story}>
      <View style={styles.storyRing}>
        <Image source={src(story.imageKey)} style={styles.storyImage} resizeMode="cover" />
        {story.own ? <View style={styles.storyPlus}><Text style={styles.storyPlusText}>+</Text></View> : null}
      </View>
      <Text style={styles.storyName}>{story.name}</Text>
    </View>
  );
}

function PostCard({ post, onLike, onSave, onComment }) {
  const lastComments = (post.comments || []).slice(-2);
  return (
    <View style={styles.postCard}>
      <View style={styles.postHead}>
        <Image source={src(post.author.avatarKey)} style={styles.avatar} />
        <View style={styles.flex}>
          <Text style={styles.userName}>{post.author.handle}</Text>
          <Text style={styles.meta}>{post.location} · {post.timeLabel}</Text>
        </View>
      </View>
      <Image source={src(post.imageKey)} style={styles.postPhoto} resizeMode="cover" />
      <View style={styles.postActions}>
        <View style={styles.rowCenter}>
          <Pressable onPress={onLike} style={styles.actionHit}><Text style={[styles.actionIcon, post.liked && styles.pinkIcon]}>{post.liked ? '♥' : '♡'}</Text></Pressable><Text style={styles.smallCount}>{post.likes}</Text>
          <Pressable onPress={onComment} style={styles.actionHit}><Text style={styles.actionIcon}>◯</Text></Pressable><Text style={styles.smallCount}>{post.commentsCount}</Text>
        </View>
        <Pressable onPress={onSave} style={styles.actionHit}><Text style={[styles.actionIcon, post.saved && styles.pinkIcon]}>{post.saved ? '■' : '□'}</Text></Pressable>
      </View>
      <Text style={styles.caption}><Text style={styles.userName}>{post.author.handle}</Text> {post.caption}</Text>
      {lastComments.map((comment) => <Text key={comment.id} style={styles.caption}><Text style={styles.userName}>{comment.authorName}</Text> {comment.text}</Text>)}
      <Pressable onPress={onComment}><Text style={styles.commentLink}>Добавить комментарий</Text></Pressable>
    </View>
  );
}

function CommentModal({ visible, post, onClose, api, updateData, flash }) {
  const [text, setText] = useState('');
  const submit = async () => {
    if (!text.trim() || !post) return;
    try {
      const result = await api.post(`/api/posts/${post.id}/comments`, { userId: USER_ID, text: text.trim() });
      updateData({ posts: result.posts, currentUser: result.currentUser });
      setText('');
      onClose();
      flash('Комментарий добавлен');
    } catch (err) {
      flash(err.message);
    }
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalShade}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Комментарий</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Напишите комментарий"
            placeholderTextColor="#A7A1BA"
            style={[styles.textInput, styles.textArea]}
            multiline
          />
          <View style={styles.modalActions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Отмена</Text></Pressable>
            <Pressable style={styles.primaryButtonSmall} onPress={submit}><Text style={styles.primaryButtonText}>Отправить</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function VideoScreen({ data, api, updateData, flash }) {
  const [index, setIndex] = useState(0);
  const video = data.videos[index % Math.max(data.videos.length, 1)];

  const likeVideo = async () => {
    try {
      const result = await api.post(`/api/videos/${video.id}/like`, { userId: USER_ID });
      updateData({ videos: result.videos });
    } catch (err) {
      flash(err.message);
    }
  };

  if (!video) return <View style={styles.fullScreen} />;
  return (
    <ImageBackground source={src(video.imageKey)} style={styles.fullScreen} resizeMode="cover">
      <View style={styles.videoShade} />
      <SafeAreaView style={styles.videoSafe}>
        <View style={styles.videoTop}>
          <Text style={styles.videoTitle}>Видео</Text>
          <View style={styles.videoTabs}>
            <Text style={styles.videoTab}>Подписки</Text>
            <Text style={styles.videoTabActive}>Для вас</Text>
          </View>
        </View>
        <View style={styles.videoRail}>
          <View style={styles.videoAvatarWrap}><Image source={src(video.author.avatarKey)} style={styles.videoAvatar} /></View>
          <VideoAction icon={video.liked ? '♥' : '♡'} value={video.likesLabel} active={video.liked} onPress={likeVideo} />
          <VideoAction icon="●" value={String(video.commentsCount)} />
          <VideoAction icon="↧" value="Далее" onPress={() => setIndex((value) => value + 1)} />
          <View style={styles.disc}><Text style={styles.discText}>♪</Text></View>
        </View>
        <View style={styles.videoInfo}>
          <Text style={styles.videoHandle}>{video.author.handle}</Text>
          <Text style={styles.videoCaption}>{video.caption}</Text>
          <View style={styles.locationPill}><Text style={styles.locationPillText}>⌖ {video.location}</Text></View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function VideoAction({ icon, value, active, onPress }) {
  return <Pressable onPress={onPress} style={styles.videoAction}><Text style={[styles.videoActionIcon, active && styles.videoActionActive]}>{icon}</Text><Text style={styles.videoActionText}>{value}</Text></Pressable>;
}

function NearbyScreen({ data, api, updateData, flash, reload }) {
  const checkIn = async (placeId) => {
    try {
      const result = await api.post(`/api/places/${placeId}/checkin`, { userId: USER_ID });
      updateData({ places: result.places });
      flash('Отметка добавлена');
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <Screen>
      <Header title="Рядом" subtitle="Места, люди и моменты поблизости" right onRefresh={reload} />
      <View style={styles.chips}>{['Москва', 'рядом', 'сейчас'].map((chip, index) => <Chip key={chip} label={chip} active={index === 0} />)}</View>
      <ImageBackground source={assets.map} style={styles.mapCard} imageStyle={styles.mapImage} resizeMode="cover">
        <View style={styles.mapPulse} />
        <MapPin left="18%" top="38%" color={colors.coral} />
        <MapPin left="47%" top="47%" color={colors.blue} big />
        <MapPin left="72%" top="30%" color={colors.pink} />
        <MapPin left="82%" top="64%" color={colors.violet} />
      </ImageBackground>
      <View style={styles.sectionLine}><Text style={styles.sectionTitle}>Популярные места рядом</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.placesScroll}>{data.places.map((place) => <PlaceCard key={place.id} place={place} onCheckIn={() => checkIn(place.id)} />)}</ScrollView>
      <Text style={styles.sectionTitle}>Люди рядом с вами</Text>
      <View style={styles.peopleRow}>{data.people.map((person) => <PersonCard key={person.id} person={person} />)}</View>
    </Screen>
  );
}

function Chip({ label, active, onPress }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

function MapPin({ left, top, color, big }) {
  const size = big ? 36 : 28;
  return <View style={[styles.pin, { left, top, borderColor: color, width: size, height: size, borderRadius: size / 2 }]}><View style={[styles.pinDot, { backgroundColor: color }]} /></View>;
}

function PlaceCard({ place, onCheckIn }) {
  return (
    <View style={styles.placeCard}>
      <Image source={src(place.imageKey)} style={styles.placeImage} resizeMode="cover" />
      <Text style={styles.placeName}>{place.name}</Text>
      <Text style={styles.placeMeta}>{place.distance} · {place.checkins} отметок</Text>
      <Pressable onPress={onCheckIn} style={styles.placeButton}><Text style={styles.placeButtonText}>Я здесь</Text></Pressable>
    </View>
  );
}

function PersonCard({ person }) {
  return <View style={styles.personCard}><Image source={src(person.avatarKey)} style={styles.personImage} /><Text style={styles.personName}>{person.name}</Text><Text style={styles.personMeta}>{person.distance}</Text></View>;
}

function CreateScreen({ api, updateData, flash, setActive }) {
  const [caption, setCaption] = useState('');
  const [imageKey, setImageKey] = useState('lake');
  const [mood, setMood] = useState('Вдохновлено');
  const [duration, setDuration] = useState('24 часа');
  const [publishing, setPublishing] = useState(false);

  const publish = async () => {
    if (!caption.trim()) {
      Alert.alert('Добавьте подпись', 'Напишите пару слов к вашему мигу.');
      return;
    }
    setPublishing(true);
    try {
      const result = await api.post('/api/posts', { userId: USER_ID, caption: caption.trim(), imageKey, mood, duration, location: 'Москва, Россия' });
      updateData({ posts: result.posts, stories: result.stories, currentUser: result.currentUser });
      setCaption('');
      setActive('feed');
      flash('Миг опубликован');
    } catch (err) {
      flash(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <ImageBackground source={src(imageKey)} style={styles.fullScreen} resizeMode="cover">
      <View style={styles.createShade} />
      <SafeAreaView style={styles.createSafe}>
        <View style={styles.createTop}>
          <CircleButton label="×" light onPress={() => setActive('feed')} />
          <View style={styles.segment}><Text style={styles.segmentActive}>Фото</Text><Text style={styles.segmentText}>Миг</Text></View>
          <CircleButton label="✓" light onPress={publish} />
        </View>
        <View style={styles.createPanel}>
          <View style={styles.panelTop}>
            <Image source={assets.mark} style={styles.panelMark} />
            <View style={styles.flex}>
              <Text style={styles.panelSmall}>Публикация через backend</Text>
              <Text style={styles.panelTitle}>Новый миг</Text>
            </View>
            <Pressable onPress={publish}><Text style={styles.change}>{publishing ? '...' : 'Опубликовать'}</Text></Pressable>
          </View>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Что происходит сейчас?"
            placeholderTextColor="rgba(255,255,255,0.56)"
            style={styles.createInput}
            multiline
          />
          <Text style={styles.panelLabel}>Фото</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.createImageRow}>
            {createImages.map((item) => <Pressable key={item.key} onPress={() => setImageKey(item.key)}><Image source={src(item.key)} style={[styles.galleryPick, imageKey === item.key && styles.galleryPickActive]} /></Pressable>)}
          </ScrollView>
          <Text style={styles.panelLabel}>Настроение</Text>
          <View style={styles.darkChips}>{['Спокойно', 'Вдохновлено', 'Радостно', 'Любовь'].map((tag) => <DarkChip key={tag} label={tag} active={mood === tag} onPress={() => setMood(tag)} />)}</View>
          <Text style={styles.panelLabel}>Время жизни</Text>
          <View style={styles.darkChips}>{['24 часа', '7 дней', 'Навсегда'].map((tag) => <DarkChip key={tag} label={tag} active={duration === tag} onPress={() => setDuration(tag)} />)}</View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function DarkChip({ label, active, onPress }) {
  return <Pressable onPress={onPress} style={[styles.darkChip, active && styles.darkChipActive]}><Text style={[styles.darkChipText, active && styles.darkChipTextActive]}>{label}</Text></Pressable>;
}

function ProfileScreen({ data, api, updateData, flash, setActive }) {
  const [editOpen, setEditOpen] = useState(false);
  const userPosts = data.posts.filter((post) => post.author.id === data.currentUser.id);
  const user = data.currentUser;

  return (
    <Screen>
      <Header title="Профиль" right={false} />
      <View style={styles.profileHead}>
        <Image source={src(user.avatarKey)} style={styles.profileAvatar} />
        <View style={styles.flex}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileHandle}>{user.handle}</Text>
          <Text style={styles.profileBio}>{user.bio}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <Stat value={String(user.postsCount)} label="Миги" />
        <Stat value={user.followersLabel} label="Подписчики" />
        <Stat value={String(user.following)} label="Подписки" />
      </View>
      <Pressable style={styles.editButton} onPress={() => setEditOpen(true)}><Text style={styles.editButtonText}>Редактировать профиль</Text></Pressable>
      <View style={styles.profileTabs}>
        {['Фото', 'Видео', 'Места', 'Подборки'].map((tab, index) => (
          <Pressable key={tab} onPress={() => tab === 'Подборки' && setActive('collections')} style={[styles.profileTab, index === 0 && styles.profileTabActive]}>
            <Text style={[styles.profileTabText, index === 0 && styles.profileTabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.photoGrid}>{(userPosts.length ? userPosts : data.posts).slice(0, 9).map((post) => <Image key={post.id} source={src(post.imageKey)} style={styles.gridImage} resizeMode="cover" />)}</View>
      <ProfileEditModal visible={editOpen} user={user} api={api} updateData={updateData} flash={flash} onClose={() => setEditOpen(false)} />
    </Screen>
  );
}

function ProfileEditModal({ visible, user, api, updateData, flash, onClose }) {
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');

  useEffect(() => {
    setName(user?.name || '');
    setBio(user?.bio || '');
  }, [user]);

  const save = async () => {
    try {
      const result = await api.post('/api/profile', { userId: USER_ID, name: name.trim(), bio: bio.trim() });
      updateData({ currentUser: result.currentUser, posts: result.posts, stories: result.stories });
      onClose();
      flash('Профиль обновлён');
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalShade}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Профиль</Text>
          <Text style={styles.inputLabel}>Имя</Text>
          <TextInput value={name} onChangeText={setName} style={styles.textInput} placeholderTextColor="#A7A1BA" />
          <Text style={styles.inputLabel}>О себе</Text>
          <TextInput value={bio} onChangeText={setBio} style={[styles.textInput, styles.textArea]} multiline placeholderTextColor="#A7A1BA" />
          <View style={styles.modalActions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Отмена</Text></Pressable>
            <Pressable style={styles.primaryButtonSmall} onPress={save}><Text style={styles.primaryButtonText}>Сохранить</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Stat({ value, label }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

function CollectionsScreen({ data, api, updateData, flash, setActive }) {
  const [title, setTitle] = useState('');

  const createCollection = async () => {
    if (!title.trim()) return;
    try {
      const result = await api.post('/api/collections', { userId: USER_ID, title: title.trim() });
      updateData({ collections: result.collections });
      setTitle('');
      flash('Подборка создана');
    } catch (err) {
      flash(err.message);
    }
  };

  return (
    <Screen>
      <Header title="Подборки" subtitle="Идеи, места и маршруты" back onBack={() => setActive('profile')} right={false} />
      <View style={styles.chips}>{['Мои', 'Сохранённые', 'Совместные'].map((chip, index) => <Chip key={chip} label={chip} active={index === 0} />)}</View>
      <View style={styles.inlineCreate}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Название новой подборки"
          placeholderTextColor="#A7A1BA"
          style={styles.inlineInput}
        />
        <Pressable onPress={createCollection} style={styles.inlineButton}><Text style={styles.inlineButtonText}>＋</Text></Pressable>
      </View>
      <View style={styles.collectionsGrid}>{data.collections.map((item, index) => <CollectionCard key={item.id} item={item} wide={index === 0} />)}</View>
    </Screen>
  );
}

function CollectionCard({ item, wide }) {
  return (
    <ImageBackground source={src(item.imageKey)} style={[styles.collectionCard, wide && styles.collectionWide]} imageStyle={styles.collectionImage} resizeMode="cover">
      <View style={styles.collectionShade}>
        <Text style={styles.collectionTitle}>{item.title}</Text>
        <Text style={styles.collectionCount}>{item.countLabel}</Text>
      </View>
    </ImageBackground>
  );
}

function BottomNav({ active, setActive, dark }) {
  const items = [
    { key: 'feed', label: 'Лента', icon: '⌂' },
    { key: 'video', label: 'Видео', icon: '▷' },
    { key: 'create', label: 'Миг', icon: '+' },
    { key: 'nearby', label: 'Рядом', icon: '⌖' },
    { key: 'profile', label: 'Профиль', icon: '○' }
  ];
  return (
    <View pointerEvents="box-none" style={styles.navOuter}>
      <View style={[styles.nav, dark && styles.navDark]}>
        {items.map((item) => {
          const selected = active === item.key;
          if (item.key === 'create') {
            return <Pressable key={item.key} onPress={() => setActive(item.key)} style={styles.navItem}><View style={styles.bigPlus}><Text style={styles.bigPlusText}>+</Text></View><Text style={[styles.navLabel, selected && styles.navLabelActive]}>Миг</Text></Pressable>;
          }
          return (
            <Pressable key={item.key} onPress={() => setActive(item.key)} style={styles.navItem}>
              <Text style={[styles.navIcon, dark && styles.navIconDark, selected && styles.navIconActive]}>{item.icon}</Text>
              <Text style={[styles.navLabel, dark && styles.navLabelDark, selected && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function SettingsModal({ visible, apiInput, setApiInput, onClose, onConnect, loading, error }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalShade}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Backend</Text>
          <Text style={styles.sheetText}>Введите адрес сервера в локальной сети.</Text>
          <TextInput value={apiInput} onChangeText={setApiInput} style={styles.textInput} autoCapitalize="none" autoCorrect={false} keyboardType="url" />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.modalActions}>
            <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Закрыть</Text></Pressable>
            <Pressable style={styles.primaryButtonSmall} onPress={onConnect}><Text style={styles.primaryButtonText}>{loading ? '...' : 'Подключить'}</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FloatingServerButton({ onPress, dark }) {
  return <Pressable onPress={onPress} style={[styles.serverButton, dark && styles.serverButtonDark]}><Text style={styles.serverButtonText}>API</Text></Pressable>;
}

function Toast({ text }) {
  return <View style={styles.toast}><Text style={styles.toastText}>{text}</Text></View>;
}

const shadow = {
  shadowColor: colors.ink,
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 14 },
  elevation: 9
};

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.bg },
  darkApp: { backgroundColor: colors.black },
  screen: { flex: 1 },
  content: { paddingTop: TOP, paddingHorizontal: 16, paddingBottom: CONTENT_BOTTOM },
  flex: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.55 },
  blobPink: { width: width * 0.58, height: width * 0.58, backgroundColor: '#FFE3F2', left: -width * 0.18, top: 78 },
  blobBlue: { width: width * 0.72, height: width * 0.72, backgroundColor: '#E6EEFF', right: -width * 0.30, top: 320 },
  blobPeach: { width: width * 0.42, height: width * 0.42, backgroundColor: '#FFF1E7', left: width * 0.2, bottom: 70 },
  connectSafe: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  connectLogo: { width: 86, height: 86, borderRadius: 24, marginBottom: 16 },
  connectTitle: { color: colors.ink, fontSize: 42, fontWeight: '900', letterSpacing: -1.6 },
  connectText: { marginTop: 10, color: colors.text, textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  connectHint: { color: colors.muted, textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 14, fontWeight: '600' },
  inputBox: { width: '100%', marginTop: 22 },
  inputLabel: { color: colors.muted, fontSize: 12, fontWeight: '900', marginBottom: 8, marginTop: 10 },
  textInput: { minHeight: 48, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, color: colors.ink, fontSize: 15, fontWeight: '700' },
  textArea: { minHeight: 96, paddingTop: 12, textAlignVertical: 'top' },
  errorText: { color: colors.hotPink, fontSize: 12, fontWeight: '800', marginTop: 10 },
  primaryButton: { width: '100%', height: 52, borderRadius: 26, backgroundColor: colors.hotPink, alignItems: 'center', justifyContent: 'center', marginTop: 16, ...shadow, shadowColor: colors.hotPink, shadowOpacity: 0.25 },
  primaryButtonSmall: { height: 46, borderRadius: 23, paddingHorizontal: 18, backgroundColor: colors.hotPink, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  secondaryButton: { height: 46, borderRadius: 23, paddingHorizontal: 18, backgroundColor: '#F4F1FB', alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoMark: { width: 38, height: 38, borderRadius: 11, marginRight: 10 },
  logoText: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  headerSubtitle: { color: colors.muted, marginTop: 2, fontSize: 12, fontWeight: '700' },
  circleButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', ...shadow, shadowOpacity: 0.08, elevation: 4 },
  circleButtonLight: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)' },
  circleButtonText: { color: colors.ink, fontSize: 21, fontWeight: '900' },
  circleButtonTextLight: { color: colors.white },
  backText: { fontSize: 32, color: colors.ink, fontWeight: '500', marginTop: -3 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: colors.ink, letterSpacing: -0.4, marginTop: 2, marginBottom: 14 },
  storiesRow: { paddingRight: 24, paddingBottom: 18 },
  story: { width: 76, marginRight: 12, alignItems: 'center' },
  storyRing: { width: 68, height: 68, borderRadius: 34, borderWidth: 3, borderColor: colors.hotPink, padding: 3, backgroundColor: colors.card },
  storyImage: { width: '100%', height: '100%', borderRadius: 29 },
  storyPlus: { position: 'absolute', right: -2, bottom: 2, width: 21, height: 21, borderRadius: 11, backgroundColor: colors.violet, borderWidth: 2, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  storyPlusText: { color: colors.white, fontWeight: '900', fontSize: 14, marginTop: -1 },
  storyName: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 7 },
  postCard: { backgroundColor: colors.card, borderRadius: 30, overflow: 'hidden', marginBottom: 20, ...shadow },
  postHead: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 11 },
  userName: { color: colors.ink, fontWeight: '900' },
  meta: { color: colors.muted, marginTop: 2, fontSize: 12, fontWeight: '700' },
  postPhoto: { width: '100%', height: Math.min(430, width * 1.04), backgroundColor: colors.line },
  postActions: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  actionHit: { paddingVertical: 5, paddingRight: 7 },
  actionIcon: { color: colors.ink, fontSize: 28, fontWeight: '800', marginRight: 4 },
  pinkIcon: { color: colors.hotPink },
  smallCount: { color: colors.ink, fontSize: 13, fontWeight: '900', marginRight: 14 },
  caption: { color: colors.text, fontSize: 14, lineHeight: 20, paddingHorizontal: 14, paddingBottom: 7, fontWeight: '500' },
  commentLink: { color: colors.muted, fontSize: 13, paddingHorizontal: 14, paddingBottom: 16, paddingTop: 2, fontWeight: '800' },
  fullScreen: { flex: 1, backgroundColor: colors.black },
  videoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.20)' },
  videoSafe: { flex: 1, paddingTop: TOP, paddingHorizontal: 18, paddingBottom: CONTENT_BOTTOM + 10 },
  videoTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  videoTitle: { color: colors.white, fontSize: 22, fontWeight: '900' },
  videoTabs: { flexDirection: 'row', gap: 24 },
  videoTab: { color: 'rgba(255,255,255,0.70)', fontSize: 15, fontWeight: '800' },
  videoTabActive: { color: colors.hotPink, fontSize: 15, fontWeight: '900', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: colors.hotPink },
  videoRail: { position: 'absolute', right: 16, bottom: CONTENT_BOTTOM + 132, alignItems: 'center' },
  videoAvatarWrap: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: colors.white, marginBottom: 12 },
  videoAvatar: { width: '100%', height: '100%', borderRadius: 24 },
  videoAction: { alignItems: 'center', marginVertical: 9 },
  videoActionIcon: { color: colors.white, fontSize: 34, fontWeight: '900' },
  videoActionActive: { color: colors.hotPink },
  videoActionText: { color: colors.white, fontSize: 12, fontWeight: '900', marginTop: 2 },
  disc: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.44)', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  discText: { color: colors.white, fontSize: 23 },
  videoInfo: { marginTop: 'auto', paddingRight: 70 },
  videoHandle: { color: colors.white, fontSize: 17, fontWeight: '900', marginBottom: 9 },
  videoCaption: { color: colors.white, fontSize: 16, lineHeight: 23, fontWeight: '700' },
  locationPill: { alignSelf: 'flex-start', marginTop: 12, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 12, paddingVertical: 8 },
  locationPillText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  chips: { flexDirection: 'row', gap: 9, marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: '#EFEAFF', borderColor: '#EFEAFF' },
  chipText: { color: colors.text, fontSize: 13, fontWeight: '800' },
  chipTextActive: { color: colors.violet, fontWeight: '900' },
  mapCard: { height: 210, borderRadius: 30, overflow: 'hidden', marginBottom: 24, backgroundColor: colors.faint, ...shadow },
  mapImage: { borderRadius: 30 },
  mapPulse: { position: 'absolute', left: '43%', top: '38%', width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(47,123,255,0.12)' },
  pin: { position: 'absolute', backgroundColor: colors.white, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  pinDot: { width: 9, height: 9, borderRadius: 5 },
  sectionLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  placesScroll: { paddingBottom: 20 },
  placeCard: { width: 154, marginRight: 12, backgroundColor: colors.card, padding: 9, borderRadius: 22, borderWidth: 1, borderColor: colors.line },
  placeImage: { width: 136, height: 96, borderRadius: 17, marginBottom: 9, backgroundColor: colors.line },
  placeName: { color: colors.ink, fontSize: 14, fontWeight: '900' },
  placeMeta: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  placeButton: { height: 34, borderRadius: 17, backgroundColor: '#FFF0F8', alignItems: 'center', justifyContent: 'center', marginTop: 9 },
  placeButtonText: { color: colors.hotPink, fontWeight: '900', fontSize: 12 },
  peopleRow: { flexDirection: 'row', gap: 10 },
  personCard: { flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  personImage: { width: 72, height: 72, borderRadius: 20, marginBottom: 8 },
  personName: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  personMeta: { color: colors.muted, fontSize: 11, marginTop: 3, fontWeight: '700' },
  createShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,4,14,0.38)' },
  createSafe: { flex: 1, paddingTop: TOP, paddingHorizontal: 18, paddingBottom: CONTENT_BOTTOM + 10 },
  createTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  segment: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.16)', padding: 4, borderRadius: 999 },
  segmentActive: { backgroundColor: colors.white, color: colors.ink, overflow: 'hidden', borderRadius: 999, paddingHorizontal: 17, paddingVertical: 7, fontWeight: '900' },
  segmentText: { color: colors.white, paddingHorizontal: 17, paddingVertical: 7, fontWeight: '800' },
  createPanel: { marginTop: 'auto', backgroundColor: 'rgba(8,8,18,0.72)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)', borderRadius: 34, padding: 16 },
  panelTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  panelMark: { width: 40, height: 40, borderRadius: 12, marginRight: 12 },
  panelSmall: { color: 'rgba(255,255,255,0.62)', fontSize: 11, fontWeight: '700' },
  panelTitle: { color: colors.white, fontSize: 15, marginTop: 2, fontWeight: '900' },
  change: { color: '#73A2FF', fontSize: 12, fontWeight: '900' },
  createInput: { minHeight: 72, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', color: colors.white, paddingHorizontal: 14, paddingTop: 12, textAlignVertical: 'top', fontWeight: '700', fontSize: 15 },
  createImageRow: { gap: 9, paddingRight: 10 },
  galleryPick: { width: 58, height: 58, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  galleryPickActive: { borderWidth: 3, borderColor: colors.hotPink },
  panelLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '800', marginTop: 10, marginBottom: 9 },
  darkChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  darkChip: { borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 13, paddingVertical: 9 },
  darkChipActive: { backgroundColor: colors.white },
  darkChipText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  darkChipTextActive: { color: colors.ink },
  profileHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  profileAvatar: { width: 92, height: 92, borderRadius: 46, marginRight: 16, borderWidth: 4, borderColor: colors.card },
  profileName: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  profileHandle: { color: colors.muted, fontSize: 13, fontWeight: '700', marginTop: 2 },
  profileBio: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 9, fontWeight: '500' },
  statsRow: { flexDirection: 'row', marginVertical: 8 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 4 },
  editButton: { marginTop: 10, height: 46, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  editButtonText: { color: colors.ink, fontWeight: '900' },
  profileTabs: { flexDirection: 'row', marginTop: 18, marginBottom: 12, backgroundColor: colors.card, borderRadius: 999, padding: 4, borderWidth: 1, borderColor: colors.line },
  profileTab: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  profileTabActive: { backgroundColor: '#FFF0F8' },
  profileTabText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  profileTabTextActive: { color: colors.hotPink, fontWeight: '900' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridImage: { width: (width - 38) / 3, height: (width - 38) / 3, borderRadius: 3, marginBottom: 3, backgroundColor: colors.line },
  inlineCreate: { flexDirection: 'row', gap: 9, marginBottom: 16 },
  inlineInput: { flex: 1, height: 48, borderRadius: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, color: colors.ink, fontWeight: '700' },
  inlineButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.hotPink, alignItems: 'center', justifyContent: 'center' },
  inlineButtonText: { color: colors.white, fontSize: 24, fontWeight: '900' },
  collectionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  collectionCard: { width: '48.5%', height: 180, borderRadius: 24, overflow: 'hidden', marginBottom: 12, backgroundColor: colors.line },
  collectionWide: { width: '100%', height: 220 },
  collectionImage: { borderRadius: 24 },
  collectionShade: { flex: 1, justifyContent: 'flex-end', padding: 16, backgroundColor: 'rgba(4,5,16,0.28)' },
  collectionTitle: { color: colors.white, fontSize: 17, fontWeight: '900' },
  collectionCount: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, fontWeight: '700' },
  navOuter: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 14, paddingBottom: 12 },
  nav: { height: 74, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: 'rgba(232,229,242,0.85)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', ...shadow },
  navDark: { backgroundColor: 'rgba(255,255,255,0.92)' },
  navItem: { width: (width - 28) / 5, alignItems: 'center', justifyContent: 'center' },
  navIcon: { color: '#615E74', fontSize: 24, fontWeight: '800', height: 27 },
  navIconDark: { color: '#615E74' },
  navIconActive: { color: colors.hotPink },
  navLabel: { color: '#615E74', fontSize: 11, fontWeight: '800', marginTop: 3 },
  navLabelDark: { color: '#615E74' },
  navLabelActive: { color: colors.hotPink, fontWeight: '900' },
  bigPlus: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.hotPink, alignItems: 'center', justifyContent: 'center', marginTop: -24, ...shadow, shadowColor: colors.hotPink, shadowOpacity: 0.26 },
  bigPlusText: { color: colors.white, fontSize: 34, fontWeight: '500', marginTop: -4 },
  modalShade: { flex: 1, backgroundColor: 'rgba(5,5,16,0.42)', alignItems: 'center', justifyContent: 'flex-end', padding: 14 },
  sheet: { width: '100%', borderRadius: 30, backgroundColor: colors.bg, padding: 18, borderWidth: 1, borderColor: colors.line, ...shadow },
  sheetTitle: { color: colors.ink, fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginBottom: 8 },
  sheetText: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 10, fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 14 },
  serverButton: { position: 'absolute', right: 16, top: TOP + 56, width: 44, height: 28, borderRadius: 14, backgroundColor: 'rgba(21,20,45,0.78)', alignItems: 'center', justifyContent: 'center' },
  serverButtonDark: { backgroundColor: 'rgba(255,255,255,0.24)' },
  serverButtonText: { color: colors.white, fontSize: 11, fontWeight: '900' },
  toast: { position: 'absolute', left: 24, right: 24, bottom: 102, borderRadius: 22, backgroundColor: 'rgba(21,20,45,0.92)', paddingVertical: 13, paddingHorizontal: 16, alignItems: 'center' },
  toastText: { color: colors.white, fontWeight: '900' }
});
