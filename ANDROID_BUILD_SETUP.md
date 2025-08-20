# 🔧 Android Build Environment Setup Guide

## 📋 **Prerequisites Installation**

### 1. **Install Java JDK 17+**

#### Option A: Download from Adoptium (Recommended)
1. Go to: https://adoptium.net/
2. Download **Eclipse Temurin JDK 17** for Windows
3. Run the installer
4. **Important**: Check "Add to PATH" during installation

#### Option B: Using Chocolatey (if available)
```powershell
choco install temurin17
```

#### Option C: Manual Installation
1. Download from: https://adoptium.net/temurin/releases/
2. Extract to `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`
3. Add to PATH manually

### 2. **Install Android Studio**

#### Download Android Studio
1. Go to: https://developer.android.com/studio
2. Download the latest version
3. Run the installer
4. **Important**: Install Android SDK during setup

#### Android Studio Setup
1. Open Android Studio
2. Go to **Tools > SDK Manager**
3. Install these SDK components:
   - **Android SDK Platform 34** (latest)
   - **Android SDK Build-Tools 34.0.0**
   - **Android SDK Command-line Tools**
   - **Android Emulator**
   - **Android SDK Platform-Tools**

### 3. **Set Environment Variables**

#### Windows Environment Variables
1. Open **System Properties** (Win + R, type `sysdm.cpl`)
2. Click **Environment Variables**
3. Under **System Variables**, add:

```
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x
ANDROID_HOME = C:\Users\[YourUsername]\AppData\Local\Android\Sdk
```

4. Add to **PATH**:
```
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

#### PowerShell Commands (Alternative)
```powershell
# Set JAVA_HOME
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot", "Machine")

# Set ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "Machine")

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$newPath = "$currentPath;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "Machine")
```

## 🔍 **Verification Steps**

### 1. **Verify Java Installation**
```bash
java -version
javac -version
echo $env:JAVA_HOME
```

### 2. **Verify Android SDK**
```bash
adb version
echo $env:ANDROID_HOME
```

### 3. **Verify Environment Variables**
```bash
echo $env:JAVA_HOME
echo $env:ANDROID_HOME
```

## 🚀 **Build Commands**

### **Local Android Build**
```bash
# Navigate to frontend directory
cd frontend

# Run local build
npm run build:android:local
```

### **Alternative Build Commands**
```bash
# Direct Expo command
npx expo run:android

# With specific device
npx expo run:android --device

# Clean build
npx expo run:android --clear
```

## 📱 **Testing on Device**

### **Enable Developer Options**
1. Go to **Settings > About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings > Developer Options**
4. Enable **USB Debugging**

### **Connect Device**
1. Connect Android device via USB
2. Allow USB debugging when prompted
3. Run `adb devices` to verify connection

### **Install APK**
```bash
# Build and install directly
npx expo run:android --device

# Or install existing APK
adb install app-debug.apk
```

## 🎯 **Troubleshooting**

### **Common Issues**

#### 1. Java Not Found
```bash
# Check if Java is in PATH
where java
echo $env:JAVA_HOME

# Reinstall Java if needed
# Make sure to check "Add to PATH" during installation
```

#### 2. Android SDK Not Found
```bash
# Check Android Studio installation
# Verify SDK path in Android Studio > SDK Manager
echo $env:ANDROID_HOME

# Reinstall Android Studio if needed
```

#### 3. Build Fails
```bash
# Clean and rebuild
npx expo run:android --clear

# Check for specific error messages
# Verify all dependencies are installed
```

#### 4. Device Not Detected
```bash
# Check USB debugging is enabled
adb devices

# Try different USB cable
# Restart adb server
adb kill-server
adb start-server
```

## 📦 **Expected Output**

### **Successful Build**
```
✅ Android build completed successfully!
📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk
📱 AAB location: android/app/build/outputs/bundle/debug/app-debug.aab
```

### **APK Size**
- **Debug APK**: ~50-80MB
- **Release APK**: ~40-60MB
- **AAB**: ~30-50MB

## 🔗 **Useful Links**

- **Java JDK**: https://adoptium.net/
- **Android Studio**: https://developer.android.com/studio
- **Expo Documentation**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/

---

**Status**: 🔧 **Setup Required**
**Next Step**: Install Java JDK 17+ and Android Studio
**Estimated Time**: 30-60 minutes
