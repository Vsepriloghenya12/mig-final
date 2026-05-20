# Исправление EAS Install dependencies

В этой версии зафиксирован пакет `babel-preset-expo` под Expo SDK 54:

```json
"babel-preset-expo": "~54.0.7"
```

Также добавлен `package-lock.json`, а `build-apk-windows.cmd` больше не удаляет lock-файл и использует `npm ci`.

Проверка перед сборкой:

```bat
cd /d D:\mig-native-app-railway-owner-v9
rmdir /s /q node_modules
rmdir /s /q .expo
npm ci --no-audit --no-fund
npx expo export --platform android --clear
```
