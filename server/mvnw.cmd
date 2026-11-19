@echo off
setlocal
set "MAVEN_CMD="
where mvn >nul 2>&1
if %ERRORLEVEL% equ 0 (
    set "MAVEN_CMD=mvn"
) else (
    if exist "%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd" (
        set "MAVEN_CMD=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd"
    )
)

if "%MAVEN_CMD%"=="" (
    echo Error: Maven executable not found. Please install Maven or add to PATH.
    exit /b 1
)

call "%MAVEN_CMD%" %*
exit /b %ERRORLEVEL%
