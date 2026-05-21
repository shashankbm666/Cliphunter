@echo off
set "ROOT=%~dp0.."
set "PATH=%ROOT%\.tools\node-v22.22.0-win-x64;%PATH%"
cd /d "%ROOT%"
".tools\node-v22.22.0-win-x64\npm.cmd" run dev --workspace frontend
