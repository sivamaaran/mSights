# mSights — Aircraft MRO Scheduler

A cross-platform (Web, iOS, Android) application for Aircraft MRO Planning teams to manage **hangar occupancy**, **slot scheduling**, and **maintenance work orders**.

Built with **Expo (React Native)** and **Firebase**.

---

## Features

### Dashboard
- Real-time hangar occupancy overview with visual progress bars
- Active work order summary cards
- Per-hangar slot utilization breakdown
- Live data via Firestore real-time listeners

### Hangar Management
- Add, edit, and delete hangars
- Configure slot capacity per hangar
- Set hangar status (Operational / Maintenance / Closed)
- Visual slot grid display

### Maintenance Scheduler
- Create maintenance work orders (A/B/C/D-Check, Engine Change, AOG, etc.)
- Assign aircraft, hangar, and slot to each work order
- Set priority levels: Low / Medium / High / Critical
- Filter work orders by status
- Track estimated man-hours and assigned teams

### Aircraft Registry
- Full aircraft registry with registration, type, MSN, engine info
- Track flight hours and cycles
- Status tracking: Active / In Maintenance / AOG / Retired
- Search by registration, type, or airline

### Authentication
- Email/password sign-up and login
- Role-based access: Admin / Planner / Technician / Viewer
- Password reset via email
- Persistent sessions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 51 + React Native |
| Navigation | Expo Router (file-based) |
| Database | Firebase Firestore |
| Authentication | Firebase Auth |
| UI | Custom component library |
| Icons | @expo/vector-icons (Ionicons) |
| Platforms | Web, iOS, Android |

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd mSights
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password)
4. Enable **Firestore Database**
5. Copy your config to `.env.local`:

```bash
cp .env.example .env.local
# Edit .env.local with your Firebase values
```

### 3. Deploy Firestore Rules

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 4. Run the App

```bash
# Web
npm run web

# iOS (requires macOS + Xcode)
npm run ios

# Android (requires Android Studio)
npm run android
```

---

## Firebase Configuration

### Firestore Collections

| Collection | Description |
|-----------|-------------|
| `users` | User profiles with roles |
| `hangars` | Hangar definitions and capacity |
| `slots` | Individual hangar slots |
| `schedules` | Maintenance work orders |
| `aircraft` | Aircraft registry |

### User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access, can delete any resource |
| `planner` | Create/edit schedules, hangars, aircraft |
| `technician` | Read access + update work order status |
| `viewer` | Read-only access |

### Security Rules

Firestore security rules are in `firestore.rules`. Key rules:
- All reads require authentication
- Writes require `planner` or `admin` role
- Deletes require `admin` role for critical data

---

## Project Structure

```
mSights/
├── app/
│   ├── (auth)/          # Auth screens (login, register, forgot-password)
│   ├── (tabs)/          # Main app screens
│   │   ├── dashboard.tsx
│   │   ├── hangars.tsx
│   │   ├── scheduler.tsx
│   │   ├── aircraft.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx      # Root layout with auth guard
│   └── index.tsx        # Entry redirect
├── components/
│   └── ui/              # Reusable UI components
├── config/
│   └── firebase.ts      # Firebase initialization
├── constants/
│   └── theme.ts         # Design tokens (colors, spacing, typography)
├── context/
│   └── AuthContext.tsx  # Authentication context
├── services/            # Firestore CRUD services
│   ├── authService.ts
│   ├── hangarService.ts
│   ├── schedulerService.ts
│   └── aircraftService.ts
├── firestore.rules      # Security rules
└── firestore.indexes.json
```

---

## Building for Production

### Web (Firebase Hosting)
```bash
npm run build:web
firebase deploy --only hosting
```

### iOS
```bash
npx expo build:ios
# or with EAS
npx eas build --platform ios
```

### Android
```bash
npx expo build:android
# or with EAS
npx eas build --platform android
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

---

## License

MIT — Built for Aviation MRO Planning Teams
