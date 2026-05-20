@echo off
cd /d "%~dp0server"
if not exist node_modules npm install
set OWNER_TOKEN=mig-owner-demo
npm start
pause
