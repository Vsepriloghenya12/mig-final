import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { colors } from '../../theme';
import { mediaSource, isVideoMedia } from '../../utils/media';

export function MediaView({ item, style, imageStyle, videoStyle, shouldPlay = false, muted = true, controls = false, resizeMode = ResizeMode.COVER }) {
  const source = mediaSource(item);
  if (!source) return <View style={[styles.empty, style]} />;
  if (isVideoMedia(item)) {
    return <Video source={source} style={[style, videoStyle]} resizeMode={resizeMode} shouldPlay={shouldPlay} isLooping isMuted={muted} useNativeControls={controls} />;
  }
  return <Image source={source} style={[style, imageStyle]} resizeMode={resizeMode === ResizeMode.CONTAIN ? 'contain' : 'cover'} />;
}

const styles = StyleSheet.create({
  empty: { backgroundColor: colors.faint }
});
