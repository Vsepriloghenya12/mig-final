# Миг v13

Нативное Expo-приложение + Express backend для Railway.

## Что включено

- фирменный header с полноценным логотипом;
- обновление ленты через pull-to-refresh;
- кнопка личных сообщений вместо кнопки обновления;
- истории с цветом обводки по настроению;
- лента без карточных обёрток;
- переработанное нижнее меню;
- публикация постов, историй, видео и мест из галереи телефона;
- личные сообщения;
- фото/видео в диалоге;
- мини-игры в диалоге: напёрстки, три карты, футбол;
- backend с загрузкой файлов, пользователями, диалогами и owner-страницей.

## Локальный backend

```bat
cd /d D:\mig-final\server
npm install
npm start
```

Проверка:

```text
http://localhost:4000/api/health
```

## APK

```bat
cd /d D:\mig-final
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund
npx expo export --platform android --clear
set EAS_SKIP_AUTO_FINGERPRINT=1
npx eas build -p android --profile apk --clear-cache
```
