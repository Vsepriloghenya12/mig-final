@echo off
set /p BACKEND_URL=Paste Railway backend URL, for example https://mig-production.up.railway.app: 
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='App.js'; $u='%BACKEND_URL%'.Trim().TrimEnd('/'); $s=Get-Content $p -Raw; $s=$s -replace \"const DEFAULT_API_URL = '.*?';.*\", \"const DEFAULT_API_URL = '$u';\"; Set-Content $p $s -Encoding UTF8"
echo App.js updated. Now build APK with build-apk-windows.cmd
pause
