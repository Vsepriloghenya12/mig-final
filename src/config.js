import Constants from 'expo-constants';

export const API_URL =
  (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : '') ||
  Constants.expoConfig?.extra?.apiUrl ||
  'https://mig-final-production.up.railway.app';

export const POLL_MS = 2600;
