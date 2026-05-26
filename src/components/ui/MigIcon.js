import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
  ChevronLeft,
  Check,
  Ellipsis,
  Heart,
  Plus,
  Sparkles,
  X,
} from 'lucide-react-native';
import { assets } from '../../assets';
import { colors, shadow } from '../../theme';
import { useTheme } from '../../theme-context';

function stroke(active, color) {
  return color || (active ? colors.hot : '#2A2740');
}

function renderLucide(Comp, { size = 24, active, color, fillActive = false, strokeWidth = 2.3 }) {
  const c = stroke(active, color);
  return <Comp size={size} color={c} strokeWidth={strokeWidth} fill={fillActive && active ? c : 'transparent'} />;
}

function BrandAsset({ source, size = 24, active = false, dimWhenInactive = true }) {
  return (
    <Image
      source={source}
      resizeMode="contain"
      style={{ width: size, height: size, opacity: !dimWhenInactive || active ? 1 : 0.76, transform: [{ scale: active ? 1.02 : 0.94 }] }}
    />
  );
}

export function Icon({ name, size = 24, active, color }) {
  const { isDark } = useTheme();
  const feedIcon = isDark ? assets.navFeedDark : assets.navFeed;
  const videoIcon = isDark ? assets.navVideoDark : assets.navVideo;
  const nearIcon = isDark ? assets.navNearbyDark : assets.navNearby;
  const profileIcon = isDark ? assets.navProfileDark : assets.navProfile;
  if (name === 'home') return <BrandAsset source={feedIcon} size={size + 3} active={!!active} />;
  if (name === 'video') return <BrandAsset source={videoIcon} size={size + 3} active={!!active} />;
  if (name === 'near') return <BrandAsset source={nearIcon} size={size + 3} active={!!active} dimWhenInactive={!color} />;
  if (name === 'profile') return <BrandAsset source={profileIcon} size={size + 3} active={!!active} />;
  if (name === 'mail') return <BrandAsset source={active ? assets.mailActive : assets.mailInactive} size={size + 6} active={!!active} dimWhenInactive={false} />;
  if (name === 'search') return <BrandAsset source={assets.searchIcon} size={size + 7} active={!!active} dimWhenInactive={false} />;
  if (name === 'send' || name === 'share') return <BrandAsset source={assets.shareBrand} size={size + 2} active={!!active} dimWhenInactive={false} />;
  if (name === 'save' || name === 'collections') return <BrandAsset source={active ? assets.saveActive : assets.saveInactive} size={size + 3} active={!!active} dimWhenInactive={false} />;
  if (name === 'image') return <BrandAsset source={feedIcon} size={size + 3} active={!!active} dimWhenInactive={false} />;
  if (name === 'create') return <BrandAsset source={assets.navCreate} size={size + 4} active={true} dimWhenInactive={false} />;
  if (name === 'check') return renderLucide(Check, { size, active, color, fillActive: false });
  if (name === 'more') return renderLucide(Ellipsis, { size, active, color, fillActive: false });
  if (name === 'back') return renderLucide(ChevronLeft, { size, active, color, fillActive: false });
  if (name === 'close') return renderLucide(X, { size, active, color, fillActive: false });
  if (name === 'plus') return renderLucide(Plus, { size, active, color, fillActive: false });
  if (name === 'heartOn') return renderLucide(Heart, { size, active: true, color: colors.hot, fillActive: true, strokeWidth: 2.15 });
  if (name === 'heart') return renderLucide(Heart, { size, active, color, fillActive: !!active, strokeWidth: 2.15 });
  return renderLucide(Sparkles, { size, active, color, fillActive: false });
}


export function MailIcon({ active }) {
  const { isDark, palette } = useTheme();
  return (
    <View style={[styles.mailButton, active && styles.mailButtonActive, { backgroundColor: isDark ? '#000000' : colors.white, borderColor: active ? colors.hot : (isDark ? palette.line : colors.white) }]}> 
      <Image source={active ? assets.mailActive : assets.mailInactive} style={styles.mailImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  mailButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  mailButtonActive: {
    shadowColor: colors.hot,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  mailImage: {
    width: 31,
    height: 31,
  },
});
