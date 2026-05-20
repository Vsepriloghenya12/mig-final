# Mig backend

Express backend for the Mig native app.

Local:

```bash
npm install
OWNER_TOKEN=mig-owner-demo npm start
```

Railway:

- Dockerfile is in project root.
- Set `OWNER_TOKEN`.
- Optional persistent storage: `DATA_DIR=/data` with Railway Volume mounted to `/data`.

Owner page:

```text
/owner
```
