# Миг v23

Нативное Expo-приложение + Express backend для Railway.

## Production-этапы, уже добавленные

- рабочий backend для пользователей, постов, историй, видео, мест, сообщений и мини-игр;
- загрузка фото/видео из галереи;
- жалобы, блокировки и owner-модерация;
- удаление аккаунта и данных пользователя;
- публичные юридические страницы: `/privacy`, `/terms`, `/community-guidelines`, `/moderation-policy`, `/support`, `/delete-account`;
- production пакет:
  - сжатие фото перед upload;
  - ограничение размера фото;
  - ограничение размера видео;
  - ограничение длительности видео;
  - проверка MIME-типов на backend;
  - подготовка переменных для будущего object storage.

## Локальный запуск приложения

```bat
cd /d D:\mig-final
npm install --no-audit --no-fund
npx expo start --lan --clear
```

## Локальный backend

```bat
cd /d D:\mig-final\server
npm install
npm start
```

Проверка:

```text
http://localhost:4000/api/health
http://localhost:4000/privacy
http://localhost:4000/terms
http://localhost:4000/support
```

## Media limits

Настраиваются через ENV:

```text
MAX_IMAGE_MB=8
MAX_VIDEO_MB=80
MAX_VIDEO_SECONDS=60
STORAGE_DRIVER=local
PUBLIC_UPLOAD_BASE_URL=https://your-domain.up.railway.app
```

Видео пока не транскодируется на backend. Для production-трафика следующий шаг — object storage и отдельный transcoding/thumbnail pipeline.

## APK

```bat
cd /d D:\mig-final
npm config set registry https://registry.npmjs.org/
npm install --no-audit --no-fund
npx expo export --platform android --clear
set EAS_SKIP_AUTO_FINGERPRINT=1
npx eas build -p android --profile apk --clear-cache
```

## Push-уведомления

В v23 добавлены Expo Push Notifications. После установки зависимостей приложение запрашивает разрешение на уведомления и регистрирует push token на backend.

Backend отправляет уведомления для сообщений, игр, лайков, комментариев и новых подписчиков. Для временного отключения отправки используйте `PUSH_DISABLED=true`.
