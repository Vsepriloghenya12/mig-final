# Fix: babel-preset-expo

В этой версии добавлена devDependency `babel-preset-expo`, потому что `babel.config.js` использует preset `babel-preset-expo`.

Проверка перед EAS:

```bat
npm install
npx expo export --platform android --clear
```

Если export прошёл — можно запускать сборку APK:

```bat
set EAS_SKIP_AUTO_FINGERPRINT=1
npx eas build -p android --profile apk --clear-cache
```
