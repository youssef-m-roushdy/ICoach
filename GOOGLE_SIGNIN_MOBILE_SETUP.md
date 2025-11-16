# 🔥 Google Sign-In Setup for React Native (Mobile)

## ✅ What We've Done
1. ✅ Installed `@react-native-google-signin/google-signin` package
2. ✅ Created new server endpoint: `POST /api/v1/auth/google/mobile`
3. ✅ Server now accepts `idToken` and returns JWT directly (no redirect!)

---

## 🔧 Google Cloud Console Setup

### Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Select your project (or create new one)

### Step 2: Enable Google Sign-In API
1. Go to **APIs & Services** → **Library**
2. Search for "**Google Sign-In**" or "**Google+ API**"
3. Click **Enable**

### Step 3: Create OAuth 2.0 Credentials

#### A) Web Application Client (Already have this)
- **Type**: Web application
- **Client ID**: `256773500953-r6nmkgjodfre48ldplnh3kvtdfdb4c7g.apps.googleusercontent.com`
- **Used for**: Server-side token verification

#### B) Android Client (Need to create this)
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Application type**: **Android**
4. Fill in:
   - **Name**: `iCoach Android App` (or any name)
   - **Package name**: `com.application` (check your `android/app/build.gradle`)
   - **SHA-1 certificate fingerprint**: Get from command below

### Step 4: Get SHA-1 Fingerprint

Run this command in terminal:

```powershell
# For debug build (development)
cd C:\Users\yosse\OneDrive\Desktop\Icoach-app\application\android
.\gradlew signingReport
```

Look for the **SHA-1** under `Variant: debug` → `Config: debug`

Example output:
```
Variant: debug
Config: debug
Store: C:\Users\yosse\.android\debug.keystore
Alias: androiddebugkey
MD5: A1:B2:C3...
SHA1: 12:34:56:78:90:AB:CD:EF... ← Copy this!
SHA-256: ...
```

Copy the **SHA-1** value and paste it in Google Cloud Console.

---

## 📱 React Native App Configuration

### Your Web Client ID (for app configuration):
```
256773500953-r6nmkgjodfre48ldplnh3kvtdfdb4c7g.apps.googleusercontent.com
```

### Next Steps (After Docker rebuild):
1. ✅ Configure Google Sign-In in App.tsx
2. ✅ Update SignInScreen with native Google button
3. ✅ Test the flow!

---

## 🎯 How It Works (Like Facebook/TikTok)

```
1. User clicks "Sign in with Google" 
   ↓
2. Google Sign-In SDK opens Google auth (native)
   ↓
3. User authenticates with Google
   ↓
4. SDK returns idToken to your app
   ↓
5. App sends idToken to: POST /api/v1/auth/google/mobile
   ↓
6. Server verifies token with Google
   ↓
7. Server returns: { jwt, user }
   ↓
8. App stores JWT in AsyncStorage
   ↓
9. Navigate to Home screen ✅
```

**No redirect! No deep links! Just works!** 🚀

---

## 📝 Important Notes

1. **For Expo Go (Development)**:
   - Use Expo's built-in Google auth or build development client
   - OR use web browser flow for development only

2. **For Standalone Build (Production)**:
   - Build APK with `eas build`
   - Use Android OAuth client credentials
   - Native Google Sign-In will work perfectly

3. **Package Name**:
   - Check `android/app/build.gradle` for `applicationId`
   - Default for Expo: `com.application` or similar
   - Must match Google Cloud Console configuration

---

## 🔍 Troubleshooting

### Error: "Developer Error" or "Sign in failed"
- Wrong Web Client ID in app configuration
- SHA-1 fingerprint doesn't match
- Android OAuth client not created in Google Console

### Error: "Invalid idToken"
- Token expired (only valid for 1 hour)
- Wrong audience (Web Client ID mismatch)
- Network connectivity issues

### Success Response Example:
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "jwt": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 3,
      "email": "user@gmail.com",
      "username": "user",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

## 🚀 Ready to Test!

Once Docker rebuild is complete, we'll:
1. Configure GoogleSignin in the app
2. Update SignInScreen
3. Test the complete flow

**No more redirect issues! 🎉**
