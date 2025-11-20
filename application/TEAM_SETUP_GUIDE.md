# Team Setup Guide - iCoach Application

## 🚀 Quick Start for Team Members

This guide is for team members who clone the repository for the first time.

---

## ⚠️ IMPORTANT: Prerequisites

Before starting, make sure you have:

1. ✅ **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. ✅ **Git** installed
3. ✅ **Android Studio** installed - [Download](https://developer.android.com/studio)
4. ✅ **JDK 17** (comes with Android Studio)
5. ✅ **Docker Desktop** running (for backend server)

---

## 📋 Step-by-Step Setup

### **Step 1: Clone the Repository**

```bash
git clone <repository-url>
cd Icoach-app
```

---

### **Step 2: Backend Setup (Server)**

```bash
cd server

# Start Docker containers (PostgreSQL + API)
docker-compose up -d

# Verify containers are running
docker ps

# You should see:
# - icoach-server (port 5000)
# - postgres (port 5432)
```

**Verify server is running:**
- Open browser: http://localhost:5000/api
- You should see API response

---

### **Step 3: Application Setup**

```bash
cd ../application

# Install dependencies
npm install
```

---

### **Step 4: Create .env File**

Create a `.env` file in the `application` folder:

```bash
# Copy the example file
cp .env.example .env
```

**Edit `.env` file with these values:**

```env
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_AI_API_URL=http://localhost:8000

# Environment
EXPO_PUBLIC_ENV=development

# Google Sign-In Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=256773500953-r6nmkgjodfre48ldplnh3kvtdfdb4c7g.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=256773500953-pp37d0ko6383lv200rjfg5epfd73mgta.apps.googleusercontent.com
```

---

### **Step 5: Android Emulator Setup**

#### **Create an Emulator (First Time Only)**

1. Open **Android Studio**
2. Click **"More Actions"** → **"Virtual Device Manager"**
3. Click **"Create Device"**
4. Select **"Pixel 5"** or any phone
5. Click **"Next"**
6. Select system image:
   - **Recommended:** API Level 33 (Android 13) or 34 (Android 14)
   - Click **"Download"** if not installed
7. Click **"Next"** → **"Finish"**

#### **Start the Emulator**

**Option A: From Android Studio**
1. Open Android Studio
2. Click "Device Manager" (phone icon)
3. Click ▶️ (play button) next to your emulator
4. Wait for it to fully boot (1-2 minutes)

**Option B: From Command Line**
```bash
# List available emulators
emulator -list-avds

# Start emulator (replace with your emulator name)
emulator -avd Pixel_5_API_33 &
```

**Verify emulator is running:**
```bash
adb devices
```

Should show:
```
List of devices attached
emulator-5554   device
```

---

### **Step 6: Build & Install the App (CRITICAL STEP)**

⚠️ **This is the most important step! Don't skip it!**

```bash
# Make sure you're in the application folder
cd application

# Build and install the app on the emulator
npx expo run:android
```

**What this does:**
- Generates native Android project
- Compiles the app
- Installs it on your emulator
- **Takes 5-10 minutes the first time** ⏳

**Wait for it to complete!** You'll see:
```
✔ Built successfully
✔ Installed the app on the device
```

---

### **Step 7: Set Up Port Forwarding**

Run the port forwarding script (do this each time you start the emulator):

**Windows (PowerShell):**
```powershell
# From the application folder
.\reverse-ports-forwarding
```

**Or manually:**
```bash
adb reverse tcp:5000 tcp:5000
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8000 tcp:8000
```

**Verify:**
```bash
adb reverse --list
```

---

### **Step 8: Start Development**

Now you can develop normally!

```bash
# Start the Metro bundler
npm start

# The app should already be open in the emulator
# If not, press 'a' to open it
```

---

## 🎯 Daily Development Workflow

After the initial setup, your daily workflow is:

```bash
# 1. Start backend (if not running)
cd server
docker-compose up -d

# 2. Start emulator (if not running)
emulator -avd Pixel_5_API_33 &

# 3. Set up port forwarding
cd ../application
.\reverse-ports-forwarding

# 4. Start the app
npm start
# Press 'a' if app doesn't open automatically
```

---

## 🐛 Common Issues & Solutions

### **Issue 1: Permission Denied / "Cannot open" Errors**

**Problem:** Files owned by Administrator/Root or `.expo` folder uploaded to cloud.

**Symptoms:**
- `tar: .expo/README.md: Cannot open: Permission denied`
- `EACCES: permission denied`
- EAS build fails with permission errors

**This happens when:**
- You ran `npm install` or `expo` commands with `sudo` (Mac/Linux)
- You ran commands as Administrator (Windows)
- The `.expo` folder was accidentally uploaded

**Solution:**

**Windows:**
```powershell
# Run the fix script
.\fix-permissions-windows.ps1

# Or manually:
# 1. Delete locked folders
Remove-Item -Recurse -Force application\.expo
Remove-Item -Recurse -Force application\node_modules

# 2. Reinstall
cd application
npm install
```

**Mac/Linux:**
```bash
# Run the fix script (recommended)
chmod +x fix-permissions-unix.sh
./fix-permissions-unix.sh

# Or manually:
# 1. Fix ownership
sudo chown -R $USER:$USER .

# 2. Delete locked folders
rm -rf application/.expo
rm -rf application/node_modules

# 3. Reinstall
cd application
npm install
```

**After cleanup, rebuild:**
```bash
eas build --profile development --platform android --clear-cache
```

⚠️ **CRITICAL:** Never use `sudo` or Administrator for npm/expo commands!

---

### **Issue 2: "No development build found" Error**

**Problem:** You skipped Step 6 or the build failed.

**Solution:**
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

---

### **Issue 3: "Android build failed - unknown error"**

**Possible causes:**

**A) Emulator not running**
```bash
# Check if emulator is running
adb devices

# If no device, start emulator
emulator -avd Pixel_5_API_33 &
```

**B) Android SDK not found**

Set environment variables in your terminal or add to system:

**Windows:**
```powershell
$env:ANDROID_HOME = "C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
```

**Mac/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**C) Java/JDK not found**

Ensure JDK 17 is installed:
```bash
java -version
# Should show: openjdk version "17.x.x"
```

**D) Gradle build failed**

```bash
# Clear Gradle cache
cd android
./gradlew clean
cd ..

# Rebuild
npx expo run:android
```

---

### **Issue 3: "Cannot connect to server"**

**Check backend is running:**
```bash
docker ps
# Should show icoach-server container
```

**Check port forwarding:**
```bash
adb reverse --list
# Should show tcp:5000 and tcp:8081
```

**Restart port forwarding:**
```bash
.\reverse-ports-forwarding
```

---

### **Issue 4: "Metro bundler error"**

```bash
# Clear Metro cache
npx expo start --clear

# Or clear all caches
npm start -- --clear
rm -rf node_modules
npm install
```

---

### **Issue 5: App crashes on startup**

**Check logs:**
```bash
# Android logs
adb logcat | grep -i "ReactNative"

# Or in another terminal while app is running
npx react-native log-android
```

**Common fix:**
```bash
# Reinstall the app
npx expo run:android
```

---

## 📱 Building APK for Testing

### **Development Build (Internal Testing)**

```bash
# Build locally
eas build --profile development --platform android --local

# Or build in cloud (requires EAS account)
eas build --profile development --platform android
```

### **Production Build**

```bash
eas build --profile production --platform android
```

---

## 🔑 EAS Account (Optional)

EAS is **NOT required** for local development, but useful for:
- Building APKs in the cloud
- Submitting to Google Play Store
- Team collaboration features

**To login:**
```bash
npm install -g eas-cli
eas login
```

Use the same account credentials as the project owner.

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Studio Setup](https://developer.android.com/studio)
- [Docker Documentation](https://docs.docker.com/)

---

## ✅ Checklist Before Asking for Help

Before reporting issues, verify:

- [ ] Docker containers are running (`docker ps`)
- [ ] Backend is accessible (http://localhost:5000/api)
- [ ] Android emulator is running (`adb devices`)
- [ ] Port forwarding is active (`adb reverse --list`)
- [ ] `.env` file exists in application folder
- [ ] You ran `npx expo run:android` at least once
- [ ] Dependencies are installed (`npm install`)
- [ ] No other Metro bundler is running

---

## 🆘 Still Having Issues?

1. **Share the full error message** (not just the last line)
2. **Share your terminal output** from `npx expo run:android`
3. **Check if it works on the project owner's machine** (to rule out project issues)
4. **Try on a different emulator/device**

---

## 🎉 Success!

Once setup is complete, you should be able to:
- ✅ Run the app with `npm start`
- ✅ See changes instantly with hot reload
- ✅ Debug with Chrome DevTools
- ✅ Access backend API
- ✅ Use Google Sign-In

Happy coding! 🚀
