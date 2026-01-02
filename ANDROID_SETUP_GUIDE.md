# Safety Sphere - Android App Setup Guide

## 📱 Complete Android Studio Integration Guide

This guide will help you convert the Safety Sphere web app into a fully functional Android app.

---

## 🔧 Prerequisites

Before you begin, ensure you have:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **Android Studio** | Latest | [developer.android.com](https://developer.android.com/studio) |
| **Java JDK** | 21 | [adoptium.net](https://adoptium.net) |
| **Git** | Latest | [git-scm.com](https://git-scm.com) |

### Android Studio Setup
1. Install Android Studio
2. Open SDK Manager (Tools → SDK Manager)
3. Install:
   - Android SDK Platform 34 (or latest)
   - Android SDK Build-Tools 35
   - Android Emulator
   - Android SDK Platform-Tools

---

## 🚀 Step-by-Step Setup

### Step 1: Export & Clone Project

1. In Lovable, click **"Export to GitHub"** button
2. Clone your repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Initialize Capacitor (if not done)

```bash
npx cap init "Safety Sphere" "app.lovable.4fd2c86d2d164b24a76f1edb6c1e5918"
```

### Step 4: Add Android Platform

```bash
npx cap add android
```

### Step 5: Build Web Assets

```bash
npm run build
```

### Step 6: Sync to Android

```bash
npx cap sync android
```

### Step 7: Open in Android Studio

```bash
npx cap open android
```

---

## 📂 Project Structure After Setup

```
your-project/
├── android/                    # Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml  # Permissions here
│   │   │   ├── java/               # Native Java/Kotlin code
│   │   │   └── res/                # Icons, splash screens
│   │   └── build.gradle
│   └── build.gradle
├── src/                        # Your React source code
├── capacitor.config.ts         # Capacitor configuration
└── package.json
```

---

## 🔐 Android Permissions

Edit `android/app/src/main/AndroidManifest.xml` to add required permissions:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Location permissions (for SOS location sharing) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    
    <!-- Camera permissions (for evidence capture) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <!-- Storage permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Vibration for haptic feedback -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- For making emergency calls -->
    <uses-permission android:name="android.permission.CALL_PHONE" />
    
    <!-- Internet access -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Notifications -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Sensors for shake detection -->
    <uses-feature android:name="android.hardware.sensor.accelerometer" android:required="true" />
    
    <application ...>
        <!-- Your app configuration -->
    </application>
</manifest>
```

---

## 🎨 App Icons & Splash Screen

### Generate Icons
1. Create a 1024x1024 PNG icon
2. Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
3. Place generated icons in `android/app/src/main/res/`

### Splash Screen
Edit `capacitor.config.ts`:
```typescript
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: '#1a1a2e',
    showSpinner: false,
    androidSplashResourceName: 'splash'
  }
}
```

---

## 🧪 Running the App

### On Emulator
```bash
npx cap run android
```

### On Physical Device
1. Enable **Developer Options** on your phone
2. Enable **USB Debugging**
3. Connect via USB
4. Run:
```bash
npx cap run android --target YOUR_DEVICE_ID
```

### List Available Devices
```bash
adb devices
```

---

## 🔄 Development Workflow

### Live Reload (Development)
The `capacitor.config.ts` is configured for live reload:
```typescript
server: {
  url: 'https://4fd2c86d-2d16-4b24-a76f-1edb6c1e5918.lovableproject.com?forceHideBadge=true',
  cleartext: true
}
```

This means your Android app will load from the Lovable preview URL, showing changes in real-time!

### Production Build
1. Comment out or remove the `server` block in `capacitor.config.ts`
2. Build and sync:
```bash
npm run build
npx cap sync android
```

---

## 🤖 AI Features in the App

The app includes AI-powered safety features via the `safety-analysis` Edge Function:

| Feature | Trigger | What It Does |
|---------|---------|--------------|
| **Location Analysis** | Automatic | Analyzes if current location is safe |
| **Alert Generation** | SOS Button | Creates customized emergency messages |
| **Safety Tips** | Safety Tab | Provides context-aware safety advice |

### How AI Works:
```
User Action → App → Lovable Cloud (Edge Function) → AI Gateway → Response
```

The AI is accessed via:
- File: `supabase/functions/safety-analysis/index.ts`
- No API key needed (uses Lovable AI Gateway)

---

## 📱 Native Features Mapping

| Feature | Web | Android (Native) | Hook to Use |
|---------|-----|------------------|-------------|
| **GPS Location** | Navigator API | Capacitor Geolocation | `useNativeGeolocation` |
| **Camera** | MediaDevices | Capacitor Camera | `useNativeCamera` |
| **Shake Detection** | DeviceMotion | Capacitor Motion | `useNativeShakeDetection` |
| **Haptic Feedback** | Vibrate API | Capacitor Haptics | `useNativeHaptics` |
| **Notifications** | Web Notifications | Local Notifications | `useNativeNotifications` |
| **Share** | Web Share API | Capacitor Share | `useNativeShare` |

---

## 🐛 Troubleshooting

### Java Version Error
```
error: invalid source release: 21
```
**Fix:** Install JDK 21 and set JAVA_HOME:
```bash
# Windows (PowerShell)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21..."

# macOS/Linux
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
```

### Gradle Build Failed
```bash
cd android
./gradlew clean
./gradlew build
```

### Device Not Found
```bash
adb kill-server
adb start-server
adb devices
```

### Sync Issues
```bash
npx cap sync android --force
```

---

## 📦 Building APK for Distribution

### Debug APK
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (Signed)
1. Generate keystore:
```bash
keytool -genkey -v -keystore safety-sphere.keystore -alias safety-sphere -keyalg RSA -keysize 2048 -validity 10000
```

2. Add to `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('safety-sphere.keystore')
            storePassword 'your-password'
            keyAlias 'safety-sphere'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. Build:
```bash
./gradlew assembleRelease
```

---

## ✅ Checklist Before Publishing

- [ ] Remove `server` block from `capacitor.config.ts`
- [ ] Update app name and ID in `capacitor.config.ts`
- [ ] Add proper app icons (all sizes)
- [ ] Add splash screen
- [ ] Test on multiple devices
- [ ] Test all permissions work
- [ ] Test offline functionality
- [ ] Sign with release keystore
- [ ] Test the APK on a fresh device

---

## 🔗 Quick Commands Reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Build web | `npm run build` |
| Add Android | `npx cap add android` |
| Sync | `npx cap sync android` |
| Open Android Studio | `npx cap open android` |
| Run on device | `npx cap run android` |
| Build debug APK | `cd android && ./gradlew assembleDebug` |
| Build release APK | `cd android && ./gradlew assembleRelease` |

---

## 📚 Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Lovable Documentation](https://docs.lovable.dev)
