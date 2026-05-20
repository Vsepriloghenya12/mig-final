@echo off
setlocal
cd /d %~dp0

echo Cleaning old local files...
if exist node_modules rmdir /s /q node_modules
if exist .expo rmdir /s /q .expo
if exist dist-android rmdir /s /q dist-android

echo Installing mobile dependencies...
if exist package-lock.json (
  call npm ci --no-audit --no-fund
) else (
  call npm install --no-audit --no-fund
)
if errorlevel 1 exit /b 1

echo Checking Android JavaScript bundle locally...
call npx expo export --platform android --output-dir dist-android --clear
if errorlevel 1 (
  echo.
  echo Local bundle check failed. Fix the error above before EAS build.
  exit /b 1
)

echo Building APK on EAS...
set EAS_SKIP_AUTO_FINGERPRINT=1
call npx eas build -p android --profile apk --clear-cache
endlocal
