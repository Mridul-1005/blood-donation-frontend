@echo off
REM Blood Donation App - Development Startup Script (Windows)
REM Usage: start-dev.bat

cd /d "%~dp0"

echo Loading environment variables from .env...
for /f "usebackq tokens=*" %%a in (.env) do (
    echo %%a | find "=" >nul
    if not errorlevel 1 (
        for /f "tokens=1* delims==" %%x in ("%%a") do (
            if not "%%y"=="" (
                set %%x=%%y
            )
        )
    )
)

echo Starting Spring Boot application...
call mvnw.cmd spring-boot:run