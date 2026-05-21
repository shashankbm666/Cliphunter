@echo off
cd /d "%~dp0.."
if not exist ".venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  python -m venv .venv
  ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
)
".venv\Scripts\python.exe" -m uvicorn backend.app.main:app --reload --port 8010
