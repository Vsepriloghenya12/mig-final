import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../../theme';
import { useTheme } from '../../theme-context';
import { Icon } from './MigIcon';

export function ActionSheet({ visible, title, description, onClose, children }) {
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} accessibilityViewIsModal>
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: isDark ? 'rgba(0,0,0,.22)' : 'rgba(10,8,20,.12)' }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Закрыть меню"
        />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 10) + 10, backgroundColor: palette.surface, borderColor: palette.line }]} accessibilityRole="menu">
          <View style={[styles.grabber, { backgroundColor: palette.line }]} />
          <View style={styles.header}>
            <View style={styles.titleBox}>
              {title ? <Text style={[styles.title, { color: palette.ink }]}>{title}</Text> : null}
              {description ? <Text style={[styles.description, { color: palette.muted }]}>{description}</Text> : null}
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={[styles.close, { backgroundColor: palette.faint }]} accessibilityRole="button" accessibilityLabel="Закрыть меню">
              <Icon name="close" size={22} color={palette.ink} />
            </Pressable>
          </View>
          <View style={styles.items}>{children}</View>
          <Pressable onPress={onClose} style={[styles.cancel, { backgroundColor: palette.faint }]} accessibilityRole="button" accessibilityLabel="Отмена">
            <Text style={[styles.cancelText, { color: palette.ink }]}>Отмена</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export function ActionSheetItem({ label, description, tone = 'default', onPress, icon }) {
  const { palette } = useTheme();
  const destructive = tone === 'destructive';
  const labelColor = destructive ? colors.danger : palette.ink;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.item, { backgroundColor: palette.faint, borderColor: palette.line }, pressed && { opacity: 0.78 }]}
    >
      <View style={styles.itemTextBox}>
        <Text style={[styles.itemLabel, { color: labelColor }]}>{label}</Text>
        {description ? <Text style={[styles.itemDescription, { color: palette.muted }]}>{description}</Text> : null}
      </View>
      {icon ? (
        <View style={styles.itemIcon}>
          <Icon name={icon} size={21} color={destructive ? colors.danger : colors.hot} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  sheet: {
    marginHorizontal: 14,
    marginBottom: 10,
    borderRadius: 30,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    ...shadow,
  },
  grabber: { alignSelf: 'center', width: 44, height: 5, borderRadius: 999, marginBottom: 14 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 2, paddingBottom: 12 },
  titleBox: { flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: '900' },
  description: { fontSize: 13, lineHeight: 18, marginTop: 3, fontWeight: '700' },
  close: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  items: { gap: 10 },
  item: {
    minHeight: 58,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  itemTextBox: { flex: 1, minWidth: 0 },
  itemLabel: { fontSize: 16, fontWeight: '900' },
  itemDescription: { fontSize: 13, lineHeight: 18, marginTop: 3, fontWeight: '700' },
  cancel: { height: 52, marginTop: 12, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: 16, fontWeight: '900' },
});
