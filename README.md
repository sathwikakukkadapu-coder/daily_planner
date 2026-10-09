# 📅 DuoHabit - Shared Habit & Task Planner (Web & Android)

A digital habit tracker and planner designed to match your reference spreadsheet dashboard with real-time progress sharing between you and your friend across Web and Android (Capacitor).

---

## ✨ Key Features

- **Exact Reference Spreadsheet Grid**:
  - Grouped by weeks (**Week 1**, **Week 2**, **Week 3**, **Week 4**, **Week 5**).
  - Day columns with names (`Sa`, `Su`, `Mo`, `Tu`, `We`, `Th`, `Fr`) and calendar dates (`1` to `31`).
  - Active **Today** date highlighting.
  - Interactive checkboxes with instant completion animations.
  - Calculated bottom summary rows:
    - **Progress %** (e.g. `100%`, `70%`, `50%`, `90%`, etc.)
    - **Done** count
    - **Not Done** count

- **Sleek Monthly Consistency Curve**:
  - Smooth area/spline chart matching the green curve in your reference image.
  - Y-axis markers (`0%`, `25%`, `50%`, `75%`, `100%`).
  - Interactive hover tooltips showing daily completion percentages.

- **Duo Progress & Instant Profile Switching**:
  - Single-click toggle between **Me (Sathwika)** and **Friend (Alex)**.
  - Each person has their own independent habit list and progress tracking.
  - Watch your friend's progress in real-time or switch back to your own.
  - **⚔️ Compare Both (Head-to-Head)**:
    - Overlay both consistency curves on the same chart (Emerald vs Violet).
    - Monthly leaderboard and streak counters.
    - Side-by-side live daily checklists.

- **Android App Support via Capacitor**:
  - Native Android project configured in `android/` with `dist` as the web directory.
  - Safe-area insets, notch support, and mobile touch-optimized checkboxes.
  - Non-blocking confirmation dialogs and Android Web Share API support.
  - Cleartext HTTP enabled for local Wi-Fi development.

- **Configurable Backend & Live Synchronization**:
  - Configurable backend via `VITE_API_URL` environment variable or in-app runtime settings.
  - Works with deployed cloud backends (Render, Railway) or local Wi-Fi IP (`http://192.168.x.x:3001`).
  - Offline fallback: Saves to device `localStorage` automatically when offline.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:
```bash
# Point to your deployed cloud backend for Android APK and production
VITE_API_URL=https://your-duohabit-backend.onrender.com

# Or for local Wi-Fi Android testing:
# VITE_API_URL=http://192.168.0.100:3001
```

> **Note**: You can also change the backend server URL at runtime directly from inside the app! Click **"Live Sync / Share"** in the top bar to update the **Backend Server URL**.

---

## 🚀 Web Quickstart

### 1. Start Web Server
```bash
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

### 2. Development Mode
```bash
npm run dev
```
Runs both the backend server and Vite client concurrently at **[http://localhost:5173](http://localhost:5173)**.

---

## 🤖 Android Build Steps (Capacitor)

The Android native project is located in `android/`.

### Step 1: Build & Sync Web Assets to Android
Whenever you make changes to the React code, run:
```bash
npm run cap:build
```
This builds the Vite application into `dist/` and syncs the files to `android/app/src/main/assets/public`.

### Step 2: Open in Android Studio
```bash
npm run cap:open
```
or open the `android` folder in **Android Studio**.

### Step 3: Build the APK
- In **Android Studio**: Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
- The compiled debug APK will be generated at:
  `android/app/build/outputs/apk/debug/app-debug.apk`
- Or using the command line (requires JDK 17+ and Android SDK configured):
  ```powershell
  cd android
  .\gradlew.bat assembleDebug
  ```

---

## 🌐 Deploying the Backend (for Real-Time Sync)

To keep both devices in sync over the internet:

1. Push your code to GitHub.
2. Go to **[Render.com](https://render.com)** (Free):
   - Click **New +** → **Web Service**
   - Connect your repository
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm start`
3. Once deployed, copy your Render URL (e.g. `https://your-app.onrender.com`).
4. Set `VITE_API_URL=https://your-app.onrender.com` in `.env` before running `npm run cap:build` (or enter it in the app's Share modal).
