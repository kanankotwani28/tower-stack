# Tower Rush — Android build

The Capacitor project is already scaffolded and the game is already copied in.
You need **one command** to get a shareable APK.

## Build it

Double-click `build-apk.bat`, or from a terminal in this folder:

```bash
cd android
gradlew assembleDebug
```

The APK lands at:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

That file is directly shareable — send it to anyone and they can install it
(they'll need "Install unknown apps" enabled for whatever app opens it).

## Why I couldn't build it for you

The build needs to download the Android Gradle Plugin from `dl.google.com`,
and that host is unreachable from my sandbox:

```
Could not GET '.../com/android/tools/build/gradle/8.7.2/gradle-8.7.2.jar'
   > No such host is known (dl.google.com)
```

Everything else is done — SDK path, Gradle version, icons, app name, web assets.
On your machine with normal internet it should just run. First build takes a
few minutes (it downloads Gradle 8.14.3 and the plugin); later builds are fast.

## What's already configured

| Item | Value |
|---|---|
| App name | Tower Rush |
| Package | `com.dhruv.towerrush` |
| SDK path | `local.properties` → your existing SDK |
| Gradle | 8.14.3 (bumped from 8.11.1, which caps at JDK 23 — you have JDK 24) |
| Launcher icon | generated from the Coffee shop sprite, all 5 densities |
| Web assets | `www/index.html` and `android/app/src/main/assets/public/index.html` |

## If the build complains about Java

You have JDK 24 (`C:\Program Files\Java\jdk-24`) and Android Studio ships
JDK 25. Gradle 8.14.3 supports 24. If it still objects, point it at a JDK 21:

```bash
gradlew assembleDebug -Dorg.gradle.java.home="C:/Program Files/Android/Android Studio/jbr"
```

## After you change the game

Re-copy the HTML, then rebuild:

```bash
copy ..\game\tower-rush.html www\index.html
npx cap copy android
cd android && gradlew assembleDebug
```

## For the Play Store (later)

`assembleDebug` is for sharing and testing only — Play needs a signed release
bundle:

```bash
keytool -genkey -v -keystore towerrush.keystore -alias towerrush -keyalg RSA -keysize 2048 -validity 10000
cd android && gradlew bundleRelease
```

Back that keystore up somewhere safe. Lose it and you can never update the
listing.
