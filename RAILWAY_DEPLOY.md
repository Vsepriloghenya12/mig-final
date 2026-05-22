# Railway deploy

Пушьте всю папку проекта в GitHub, кроме того, что исключено в `.gitignore`.

В Railway:

- New Project → Deploy from GitHub repo
- Root Directory: пусто
- Volume mount path: `/data`

Variables:

```text
NODE_ENV=production
OWNER_TOKEN=ваш_токен
DATA_DIR=/data
PUBLIC_URL=https://ваш-домен.up.railway.app
PUBLIC_UPLOAD_BASE_URL=https://ваш-домен.up.railway.app
STORAGE_DRIVER=local
MAX_IMAGE_MB=8
MAX_VIDEO_MB=80
MAX_VIDEO_SECONDS=60
```

Проверка:

```text
https://ваш-домен.up.railway.app/api/health
https://ваш-домен.up.railway.app/owner
https://ваш-домен.up.railway.app/privacy
```

Для большого объёма фото/видео Railway Volume лучше заменить на object storage: Cloudflare R2, Yandex Object Storage или S3.

## Push

Опционально:

```text
PUSH_DISABLED=false
```

Если нужно временно отключить отправку push-уведомлений с backend, поставьте `PUSH_DISABLED=true`.
