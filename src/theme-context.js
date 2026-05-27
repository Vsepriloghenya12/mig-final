import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors as light } from './theme';

const storageKey = 'mig.theme.mode';

const dark = {
  ...light,
  bg: '#080B18',
  surface: '#101426',
  surfaceSoft: '#171B31',
  ink: '#FFFFFF',
  text: '#FFFFFF',
  muted: '#B8B3C8',
  line: 'rgba(255,255,255,.16)',
  faint: '#20243B',
  softPink: 'rgba(242,45,143,.18)',
  dangerSoft: 'rgba(229,72,104,.18)',
  overlay: 'rgba(0,0,0,.34)',
  card: '#101426',
  input: '#171B31',
  white: '#FFFFFF',
  black: '#080B18',
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
