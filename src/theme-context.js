import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as light } from './theme';

const storageKey = 'mig.theme.mode';

const dark = {
  ...light,
  bg: '#000000',
  surface: '#07070B',
  surfaceSoft: '#0D0D13',
  ink: '#FFFFFF',
  text: '#FFFFFF',
  muted: '#B8B3C8',
  line: 'rgba(255,255,255,.16)',
  faint: '#14141C',
  softPink: 'rgba(242,45,143,.18)',
  dangerSoft: 'rgba(229,72,104,.18)',
  overlay: 'rgba(0,0,0,.34)',
  card: '#07070B',
  input: '#1B1B24',
  white: '#FFFFFF',
  black: '#000000',
};

const ThemeContext = createContext({ mode: 'light', isDark: false, palette: light, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState('light');
  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((stored) => {
      if (stored === 'dark' || stored === 'light') setMode(stored);
    }).catch(() => {});
  }, []);
  const value = useMemo(() => {
    const isDark = mode === 'dark';
    const palette = isDark ? dark : light;
    const toggleTheme = () => setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(storageKey, next).catch(() => {});
      return next;
    });
    return { mode, isDark, palette, toggleTheme };
  }, [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
