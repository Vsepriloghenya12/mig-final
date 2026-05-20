# Railway deploy — Миг backend

## Вариант через GitHub

1. Создайте новый GitHub repo.
2. Загрузите туда весь проект.
3. Railway → New Project → Deploy from GitHub repo.
4. Выберите репозиторий.
5. Railway использует `Dockerfile` из корня и запустит backend из папки `server`.

## Переменные Railway

Обязательно:

```text
OWNER_TOKEN=придумайте_сложный_токен
NODE_ENV=production
```

Опционально:

```text
DATA_DIR=/data
PUBLIC_URL=https://YOUR-RAILWAY-APP.up.railway.app
```

## Постоянное хранение

Если не подключить Volume, JSON-база может сбрасываться при пересборках. Для MVP лучше добавить Volume:

```text
Mount path: /data
Variable: DATA_DIR=/data
```

## Проверка после деплоя

```text
https://YOUR-RAILWAY-APP.up.railway.app/api/health
https://YOUR-RAILWAY-APP.up.railway.app/owner
```

В приложении используйте URL без `/api`:

```text
https://YOUR-RAILWAY-APP.up.railway.app
```
