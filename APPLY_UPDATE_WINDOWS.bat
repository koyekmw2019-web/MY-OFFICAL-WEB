@echo off
cd /d "%~dp0"
py -3 tools\apply_jlpt_ux_patch.py --check
if errorlevel 1 (echo CHECK FAILED. Existing files unchanged. & pause & exit /b 1)
py -3 tools\apply_jlpt_ux_patch.py
if errorlevel 1 (echo APPLY FAILED. Do not commit; check backup and source. & pause & exit /b 1)
echo.
echo Completed. Run tests and check Deploy Preview before merging main.
pause
