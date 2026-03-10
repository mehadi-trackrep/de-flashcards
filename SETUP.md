# DE Flashcards — Setup Guide

## 🚀 Quick Start (Local)

```bash
npm install
cp .env.local.example .env.local
# → fill in your Firebase values (see below)
npm run dev
```

---

## 🔥 Firebase Setup (~5 minutes, free)

### 1. Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it (e.g. `de-flashcards`) → Continue
3. Disable Google Analytics if you want (optional) → **Create project**

### 2. Enable Google Sign-In
1. In your project → **Build → Authentication → Get started**
2. Click **"Google"** under Sign-in providers
3. Toggle **Enable** → add your email as support email → **Save**

### 3. Create Firestore Database
1. **Build → Firestore Database → Create database**
2. Choose **"Start in test mode"** (fine for personal use)
3. Pick a region close to you → **Done**

### 4. Get Your Config
1. **Project Settings** (gear icon) → **Your apps** → click **"</>"** (Web)
2. Register the app (any nickname) → Copy the `firebaseConfig` object
3. Paste values into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=de-flashcards-xxxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=de-flashcards-xxxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=de-flashcards-xxxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Add Authorized Domain (for local dev)
1. **Authentication → Settings → Authorized domains**
2. `localhost` should already be there ✅

---

## ☁️ Deploy to Vercel

```bash
npx vercel
```

Then in Vercel dashboard → **Settings → Environment Variables** → add all 6 `NEXT_PUBLIC_FIREBASE_*` variables.

Also add your Vercel domain to Firebase:
**Authentication → Settings → Authorized domains → Add domain** → paste your `.vercel.app` URL

---

## 🗄️ Firestore Data Structure

```
users/
  {uid}/
    meta/
      info → { seeded: true, seedCount: 32 }
    cards/
      {cardId} → { id, topic, priority, done }
```

Each user gets their own isolated collection. Progress syncs in real-time across devices.
