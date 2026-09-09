@echo off
cd /d "%~dp0.."
if not exist ".dev-logs" mkdir ".dev-logs"
set "NEXT_TELEMETRY_DISABLED=1"
node --preserve-symlinks-main "node_modules\next\dist\bin\next" start -p 3000 > ".dev-logs\next-start.out.log" 2> ".dev-logs\next-start.err.log"
