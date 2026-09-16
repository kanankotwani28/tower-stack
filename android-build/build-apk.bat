@echo off
setlocal
set "ANDROID_HOME=C:\Users\BITPATNA\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PROJ=%~dp0android"

echo.
echo  Building Tower Rush debug APK...
echo  First run downloads the Android plugin, so give it a few minutes.
echo.

if not exist "%PROJ%\gradlew.bat" (
  echo  ERROR: cannot find "%PROJ%\gradlew.bat"
  echo  Run this file from inside the android-build folder.
  pause
  exit /b 1
)

cd /d "%PROJ%"
rem full path on purpose: this machine sets NoDefaultCurrentDirectoryInExePath,
rem so cmd will not find gradlew.bat by bare name
call "%PROJ%\gradlew.bat" assembleDebug

if errorlevel 1 (
  echo.
  echo  BUILD FAILED - see the messages above.
  echo.
  echo  If it mentions Java, retry with Android Studio's JDK:
  echo    call "%PROJ%\gradlew.bat" assembleDebug -Dorg.gradle.java.home="C:\Program Files\Android\Android Studio\jbr"
  echo.
  pause
  exit /b 1
)

set "APK=%PROJ%\app\build\outputs\apk\debug\app-debug.apk"
echo.
if exist "%APK%" (
  echo  Done. Your shareable APK:
  echo    %APK%
  echo.
  explorer /select,"%APK%"
) else (
  echo  Gradle reported success but the APK is not where expected:
  echo    %APK%
)
echo.
pause
