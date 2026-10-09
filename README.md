# 📅 DuoHabit - Shared Habit & Task Planner

A digital habit tracker and planner designed to match your reference spreadsheet dashboard with real-time progress sharing between you and your friend.

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

- **Online Live Synchronization & Multi-Device Sharing**:
  - **Shared Room Codes** (e.g. `DUO-HABIT-1`).
  - **Instant Share Link**: Copy and send to your friend.
  - **Live QR Code**: Point phone camera to open and sync instantly.
  - Works on your local network (`http://192.168.x.x:3001`), locally, or deployable online.
  - Offline fallback: Saves to browser `localStorage` automatically.

- **Customization & Tools**:
  - Add, edit, or delete habits with emoji icons.
  - "Share Challenge": Copy a habit into your friend's list with 1 click.
  - Customize names, avatars, and chart theme colors.
  - Month and year navigation (jump to any month).
  - JSON backup export/import.

---

## 🚀 How to Run

### 1. Start the Production Server
```bash
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

### 2. Development Mode (with Hot Reload)
```bash
npm run dev
```
Runs both the backend server and Vite frontend concurrently on **[http://localhost:5173](http://localhost:5173)**.

---

## 📱 How to Connect with Your Friend

1. Open the app and click the **"Live Sync / Share"** button in the top right header.
2. Choose your identity on this device:
   - Your device: Select **"🌸 Sathwika (Primary)"**
   - Friend's device: Select **"⚡ Alex (Friend)"**
3. Share the room:
   - **On the same Wi-Fi**: Your friend can scan the QR code with their phone camera or open the local IP link displayed in the modal (e.g. `http://192.168.0.100:3001`).
   - **Online Deployment**: Deploy to [Render.com](https://render.com) or [Railway.app](https://railway.app) for free (just push to GitHub and choose Node.js web service). Both of you can then use it from anywhere!
4. Whenever either of you checks off a habit, both screens update instantly!
