@echo off
@echo Bacth File Fired>>"%~dp0/log.txt"

@echo.>>"%~dp0/err.txt"

@call node "%~dp0/app.js" %* 2>>"%~dp0/err.txt"

@echo Bye Now>>"%~dp0/log.txt"