# 🚀 Build Standalone APK for Google Sign-In

## Why Build APK?
Expo Go doesn't support native Google Sign-In properly. You need a standalone build.

## 📦 Build Development APK (Quick Test)

### 1. Install EAS CLI
```powershell
npm install -g eas-cli
```

### 2. Login to Expo
```powershell
cd C:\Users\yosse\OneDrive\Desktop\Icoach-app\application
eas login
```

### 3. Configure EAS Build
```powershell
eas build:configure
```

### 4. Build Development APK
```powershell
eas build --profile development --platform android
```

This will:
- Build an APK file
- Take 10-15 minutes
- Give you a download link when done

### 5. Install on Your Phone
- Download the APK from the link
- Install it on your Android device
- Google Sign-In will work perfectly! ✅

---

## 🔧 Alternative: Use Expo Dev Client (Faster)

This is faster for testing:

### 1. Install expo-dev-client
```powershell
cd C:\Users\yosse\OneDrive\Desktop\Icoach-app\application
npx expo install expo-dev-client
```

### 2. Build Dev Client APK
```powershell
eas build --profile development --platform android
```

### 3. Install and Run
- Install the dev client APK on your phone
- Run: `npx expo start --dev-client`
- Google Sign-In will work!

---

## 📝 Important Notes

**Android Client ID Configuration:**
- Package name: Will be in `app.json` after EAS config
- SHA-1: EAS will provide this after first build
- Add these to Google Cloud Console

**Current Setup (Already Done):**
- ✅ Server accepts both Web and Android Client IDs
- ✅ App code is ready for native Google Sign-In
- ✅ Just needs standalone build!

---

## ⚡ Quick Summary

**For Development (Recommended):**
```powershell
npm install -g eas-cli
cd C:\Users\yosse\OneDrive\Desktop\Icoach-app\application
eas login
eas build:configure
eas build --profile development --platform android
```

**Result:** 
- You'll get an APK file
- Install it on your phone
- Google Sign-In works perfectly!
- No more Expo Go limitations! 🎉

---

## 🔄 Alternative: Keep Using Expo Go (Limited)

If you want to test NOW without building, you can temporarily use a simpler flow:
1. User enters email/password (existing system)
2. Add Google OAuth for production builds only

But for best experience (like Facebook/Instagram), **build the APK**! 🚀
