@echo off
set /p BACKEND_URL=Paste Railway backend URL, for example https://mig-final-production.up.railway.app: 
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='src/config.js'; $u='%BACKEND_URL%'.Trim().TrimEnd('/'); $s=Get-Content $p -Raw; $s=$s -replace \"export const API_URL = '.*?';\", \"export const API_URL = '$u';\"; Set-Content $p $s -Encoding UTF8"
echo src/config.js updated. Now build APK with build-apk-windows.cmd
pause
