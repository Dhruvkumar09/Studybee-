# 🎓 StudyLive — Live Classroom & Study Platform

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Android CI](https://github.com/studylive/studylive/actions/workflows/android-build.yml/badge.svg)](.github/workflows/android-build.yml)
[![Tests](https://github.com/studylive/studylive/actions/workflows/tests.yml/badge.svg)](.github/workflows/tests.yml)
[![Code Quality](https://github.com/studylive/studylive/actions/workflows/lint.yml/badge.svg)](.github/workflows/lint.yml)

StudyLive is a live classroom and study platform inspired by Zoom, engineered specifically for intensive studying, exam preparation (JEE, NEET, NCERT), and distraction-free remote lectures.

Built with **WebRTC**, **Android MediaProjection**, **Firebase Realtime Database & Authentication**, **Firebase Cloud Messaging (FCM)**, **Node.js/Express WebSockets**, and **Google Gemini AI**.

---

## 🌟 Key Features

### 👑 Authoritative Host / Teacher Controls
- **Development Host Access Code**: `13189` (authoritative server-side verified, session token issued).
- **Media Projection / Screen Sharing**: 1080p target adaptive bitrate screen broadcast.
- **Audio Control**: Low-latency microphone audio with hardware Echo Cancellation (AEC), Noise Suppression (NS), and Auto Gain Control (AGC).
- **Mute Controls**: Individual student mute and authoritative **"Mute All"** enforcement.
- **Speaking Requests**: Queue for approving/dismissing raised hands.
- **Classroom Security**: Lock/unlock classroom, toggle chat permissions.
- **Live Attendance**: Tracks join timestamp, duration, reconnect count, and online status with one-click **CSV Export**.

### 🔥 Attention Alert ("JAAGTE RAHO")
- Host-triggered high-urgency notifications (*JAAGTE RAHO 🔥*, *FOCUS KARO 🎯*, *IMPORTANT FORMULA 📐*, *5 MIN BREAK ⏳*).
- **Audible Siren**: Real-time synthesized alarm sound via Web Audio API.
- **Haptic Feedback**: Hardware vibration pattern via Android Vibrator & `navigator.vibrate`.
- **FCM Push Relay**: Background push notifications for Android participants.

### 🎯 Deep Focus Mode & Lecture Lock
- Minimalist, distraction-free studying overlay.
- Integrated study countdown timer (Pomodoro / 25-minute study intervals).
- **Lecture Lock Protection**: Prevents accidental classroom or tab exits with double-confirmation dialogs.

### 📊 Live Polls & Quizzes (Powered by Google Gemini)
- **Live Polls**: Real-time voting with instant percentage distribution bars.
- **AI Concept Check**: 1-click quiz generation on any syllabus topic using the `@google/genai` TypeScript SDK.
- Instant score tracking and answer explanations.

### 📐 AI Study Assistant
- **Instant Doubt Solver**: Answers student doubts grounded in the lecture context.
- **Lecture Summarizer**: Auto-generates key takeaways and revision points.
- **Formula Sheet Extractor**: Curated cheat sheets formatted for JEE, NEET, and NCERT.

---

## 🏗️ Architecture

```
                          ┌──────────────────────────┐
                          │   Firebase Realtime DB   │
                          │   & Firebase Auth        │
                          └─────────────┬────────────┘
                                        │
           Signaling & RTC State        │ Security Rules & Presence
                                        │
┌─────────────────────────┐             │             ┌─────────────────────────┐
│   Host / Teacher        ├─────────────┼─────────────┤   Students              │
│   (Android / Web)       │             │             │   (Android / Web)       │
│                         │             │             │                         │
│ • Screen MediaProjection│             ▼             │ • 1080p Stream Viewer   │
│ • WebRTC Audio Stream   │◄───── WebSocket (/ws) ───►│ • Hand Raise / Mic      │
│ • Authoritative Host Code│   Express / SFU Server   │ • Focus Mode Overlay    │
│ • Attention Alerts (FCM)│                           │ • Live Polls & Quizzes  │
└─────────────────────────┘                           └─────────────────────────┘
                                        ▲
                                        │
                          ┌─────────────┴────────────┐
                          │  AIProvider Abstraction  │
                          │  (Google Gemini 2.5)     │
                          └──────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- JDK 17 (for Android build)
- Android Studio / Android SDK 34 (for native Android APK)

### 1. Clone & Install
```bash
git clone https://github.com/your-org/studylive.git
cd studylive
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your `GEMINI_API_KEY` and Firebase credentials (or leave the defaults for development).

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Android Native Build

The `/android` directory contains the complete native Android project.

### Build Debug APK:
```bash
cd android
./gradlew assembleDebug
```
The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Android Permissions
- `RECORD_AUDIO` — Hardware-accelerated mic input with AEC.
- `FOREGROUND_SERVICE_MEDIA_PROJECTION` — Android 14+ screen capturing foreground service.
- `POST_NOTIFICATIONS` — High-priority heads-up attention notifications (Jaagte Raho).
- `VIBRATE` — Haptic siren vibrations.

---

## 🔒 Firebase Security Rules

Deploy the included `database.rules.json` to your Firebase Realtime Database:
```bash
firebase deploy --only database
```

---

## 🧪 Automated Testing

Run the test suite:
```bash
npm test
```
Run type-checking:
```bash
npm run lint
```

---

## 📄 License
This project is licensed under the Apache-2.0 License — see the [LICENSE](LICENSE) file for details.
