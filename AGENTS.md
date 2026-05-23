# AGENTS.md

## Repository Map

- Active mobile app: Expo React Native app at the repository root.
- Mobile source: `src/`.
- Main entry points:
  - `package.json` -> `"main": "index.js"`
  - `index.js` -> `registerRootComponent(App)`
  - `src/App.js` -> real app shell and manual screen navigation
  - `App.js` -> re-export of `src/App`
- Backend: Express app in `server/`.
- This project does not use Expo Router. Do not add an `app/` route tree unless explicitly requested.
- The mobile app is JavaScript, not TypeScript. Do not rename files to TypeScript unless explicitly requested.

## Project Rules

- Always read this file before making changes.
- Use the installed Expo plugin and relevant Expo/mobile skills for React Native / Expo work.
- Before editing, inspect the actual file being changed and follow its existing style.
- Make small, reviewable changes.
- Preserve existing architecture, manual navigation state, API contracts, auth behavior, database schema, backend routes, deployment config, and storage format unless explicitly requested.
- Do not add new dependencies unless clearly necessary; explain why first.
- Use `npm` as the package manager. For Expo packages, prefer `npx expo install`.
- Never expose secrets from `.env` files.
- If external API keys are missing, keep safe local fallback behavior.

## Mobile UI Rules

- Preserve the current brand style, colors, spacing language, and compact mobile layout unless asked to redesign.
- Do premium mobile UI work by improving polish, hierarchy, readability, touch targets, loading/empty/error states, safe-area behavior, and accessibility.
- Do not change business logic, payloads, API calls, auth flow, or navigation keys while making UI changes.
- The app mixes `StyleSheet` screens with NativeWind / rn-primitives UI components. Match the local pattern in the file being edited.
- Be careful with the absolute bottom navigation in `src/components/BottomNav.js`; screens must leave enough bottom padding.
- Keep lists readable and functional. Do not over-card mobile lists or add duplicate controls.
- Use semantic `Pressable`/button accessibility props where appropriate, readable contrast, and visible focus/touch states.

## Commands

- Install mobile dependencies: `npm install --no-audit --no-fund`
- Start Expo: `npm start`
- Start Expo on LAN: `npm run start:lan`
- Start Expo tunnel: `npm run start:tunnel`
- Export Android bundle: `npm run export:android`
- Build APK with EAS: `npm run build:apk`
- Validate Expo dependency versions: `npx expo install --check`
- Optional Expo health check: `npx expo-doctor`
- Backend install: `cd server && npm install`
- Backend start/dev: `cd server && npm start` or `cd server && npm run dev`

## Typecheck And Lint

- No `typecheck` or `lint` npm scripts are currently defined.
- `npx tsc --noEmit` is not currently a useful project check because there is no `tsconfig.json`.
- Do not add TypeScript, ESLint, or formatting config unless the task explicitly asks for it.

## Verification After Changes

- Run the closest relevant checks after code changes.
- For mobile dependency/config changes, run `npx expo install --check`.
- For mobile UI/app changes, prefer `npx expo install --check` and, when practical, `npm run export:android`.
- For backend changes, run the relevant backend command from `server/`.
- If a check cannot be run or is not configured, say so clearly.
- At the end, report:
  - files changed
  - what was verified
  - what was not verified
  - remaining risks
