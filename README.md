# Миг — fullstack MVP v9: Railway backend + страница владельца

В этой версии backend готов к деплою на Railway, а управление контентом вынесено на страницу владельца, которая открывается прямо на сервере:

```text
https://YOUR-RAILWAY-APP.up.railway.app/owner
```

## Что теперь есть

- Express backend для мобильного приложения.
- Railway/Docker конфигурация.
- Страница владельца `/owner`.
- OWNER_TOKEN-защита панели владельца.
- Управление постами, видео, местами и пользователями.
- Экспорт базы JSON.
- Сброс базы к стартовым данным.
- API для приложения: лента, лайки, комментарии, сохранения, публикация, места, профиль, подборки.
- JSON-хранилище `server/data/db.json`. На Railway можно подключить Volume и указать `DATA_DIR=/data`.

## Быстрый запуск backend локально

```bat
cd D:\mig-native-app-railway-owner-v9
run-backend-windows.cmd
```

Откройте:

```text
http://localhost:4000/owner
```

Локальный токен владельца:

```text
mig-owner-demo
```

## Деплой backend на Railway

1. Загрузите проект в GitHub.
2. В Railway создайте New Project → Deploy from GitHub repo.
3. Railway увидит `Dockerfile` и соберёт только backend.
4. В Variables добавьте:

```text
OWNER_TOKEN=ваш_сложный_токен
NODE_ENV=production
```

Опционально для постоянного JSON-хранилища:

```text
DATA_DIR=/data
```

Для этого в Railway нужно добавить Volume с mount path:

```text
/data
```

5. После деплоя откройте:

```text
https://YOUR-RAILWAY-APP.up.railway.app/api/health
https://YOUR-RAILWAY-APP.up.railway.app/owner
```

## Подключение APK к Railway backend

В приложении на первом экране введите backend URL без `/api` в конце:

```text
https://YOUR-RAILWAY-APP.up.railway.app
```

Если хотите встроить URL в APK заранее, выполните:

```bat
cd D:\mig-native-app-railway-owner-v9
set-railway-url-windows.cmd
build-apk-windows.cmd
```

## Сборка APK

```bat
cd D:\mig-native-app-railway-owner-v9
build-apk-windows.cmd
```

Если используете новый Expo-аккаунт:

```bat
npx eas logout
npx eas login
rmdir /s /q .expo
npx eas init --force
build-apk-windows.cmd
```

## API

Основные публичные endpoints:

```text
GET  /api/health
GET  /api/bootstrap?userId=ivan
POST /api/posts
POST /api/posts/:id/like
POST /api/posts/:id/save
POST /api/posts/:id/comments
POST /api/videos/:id/like
POST /api/places/:id/checkin
POST /api/profile
POST /api/collections
```

Owner endpoints защищены `OWNER_TOKEN` через заголовок `x-owner-token`:

```text
GET    /api/owner/summary
GET    /api/owner/export
POST   /api/owner/reset
POST   /api/owner/posts
PATCH  /api/owner/posts/:id
DELETE /api/owner/posts/:id
POST   /api/owner/videos
PATCH  /api/owner/videos/:id
DELETE /api/owner/videos/:id
POST   /api/owner/places
PATCH  /api/owner/places/:id
DELETE /api/owner/places/:id
PATCH  /api/owner/users/:id
```
