# Railway deploy

Пушьте всю папку проекта в GitHub, кроме того, что исключено в `.gitignore`.

В Railway:

- New Project → Deploy from GitHub repo
- Root Directory: пусто
- Variables:
  - NODE_ENV=production
  - OWNER_TOKEN=ваш_токен
  - DATA_DIR=/data
  - PUBLIC_URL=https://ваш-домен.up.railway.app
- Volume mount path: /data

Проверка:

```text
https://ваш-домен.up.railway.app/api/health
https://ваш-домен.up.railway.app/owner
```
