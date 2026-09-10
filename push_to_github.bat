@echo off
title Farmora Official - Upload to GitHub
cd /d "%~dp0"
node push_to_github.js
pause
