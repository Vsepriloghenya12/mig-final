import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { assets } from '../../assets';
import { colors } from '../../theme';

const icons = {
  like: { inactive: assets.reactionLike, active: assets.reactionLikeActive },
  comment: { inactive: assets.reactionComment, active: assets.reactionComment },
  save: { inactive: assets.reactionSave, active: assets.reactionSaveActive },
  share: { inactive: assets.reactionShare, active: assets.reactionShare },
};

export function BrandActionIcon({ name, size = 42, active = false }) {
  const config = icons[name] || icons.like;
  const source = active ? config.active : config.inactive;
  return (
    <View style={[styles.wrap, active && styles.active, { width: size, height: size }]}> 
      <Image source={source} style={styles.image} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {
    shadowColor: colors.hot,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
