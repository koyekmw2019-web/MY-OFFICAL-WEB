@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title YEKUN v7.87.6 JLPT UI Fix - QA Branch Only

echo ==========================================================
echo  STUDYING WITH YE KUN - v7.87.6 ONE-CLICK QA PATCH
echo  MUST BE EXTRACTED INTO THE GITHUB REPOSITORY ROOT
echo  DO NOT RUN ON MAIN OR PRODUCTION
echo ==========================================================
echo.
if not exist "index.html" (
  echo ERROR: index.html not found. Extract ZIP into MY-OFFICAL-WEB folder containing package.json FIRST.
  pause
  exit /b 1
)
if not exist "package.json" (
  echo ERROR: package.json not found. Wrong folder.
  pause
  exit /b 1
)
where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git is not available. Install GitHub Desktop and open its repository terminal.
  pause
  exit /b 1
)
for /f "delims=" %%B in ('git branch --show-current') do set "CURRENT_BRANCH=%%B"
if /i "%CURRENT_BRANCH%"=="main" goto :blocked
if /i "%CURRENT_BRANCH%"=="master" goto :blocked
if "%CURRENT_BRANCH%"=="" (
  echo ERROR: Git branch not detected. Please open your repository and select QA branch.
  pause
  exit /b 1
)
set "PYTHON_CMD=py -3"
py -3 --version >nul 2>nul
if errorlevel 1 (
  set "PYTHON_CMD=python"
  python --version >nul 2>nul
  if errorlevel 1 (
    echo ERROR: Python 3 is required. Please install Python 3 or use Python Launcher.
    pause
    exit /b 1
  )
)
echo QA Branch: %CURRENT_BRANCH%
echo.
echo [1/3] Checking source compatibility...
%PYTHON_CMD% tools\apply_jlpt_ux_patch.py --check
if errorlevel 1 goto :failed
echo.
echo [2/3] Applying real changes to 3 EXISTING source files...
%PYTHON_CMD% tools\apply_jlpt_ux_patch.py
if errorlevel 1 goto :failed
echo.
echo [3/3] Running JLPT source QA...
where node >nul 2>nul
if errorlevel 1 (
  echo NOTE: Node.js not found. Please run node tests\yk88-jlpt-ux-qa.mjs later.
) else (
  node tests\yk88-jlpt-ux-qa.mjs
  if errorlevel 1 goto :failed
)
echo.
echo ==========================================================
echo SUCCESS: Core UI patch is applied in your QA branch.
echo Now run npm test and npm run build before committing.
echo Check GitHub Desktop - index.html, study/jlpt-learning.html,
echo and assets/yk-jlpt-learning-v782-page.js must be MODIFIED.
echo ==========================================================
pause
exit /b 0
:blocked
echo ERROR: You are on main/master branch. Create QA branch in GitHub Desktop first.
echo No files were changed.
pause
exit /b 1
:failed
echo.
echo FAILED: do not commit / push; inspect the message above.
echo Protected backend files are not targeted by this patch.
pause
exit /b 1
