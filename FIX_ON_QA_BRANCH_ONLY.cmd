@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not in PATH. Use GitHub Desktop - Repository - Open in terminal.
  pause
  exit /b 1
)
node scripts\fix-v7880-progress-on-qa-only.mjs
if errorlevel 1 (
  echo Fix NOT applied successfully. Read the error above.
  pause
  exit /b 1
)
echo.
echo Fixed local source ONLY. Run npm run build BEFORE pushing QA branch.
pause
