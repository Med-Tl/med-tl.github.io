# ⚡ PFEHub — Final Year Project Management Platform

A full-stack educational platform for managing PFE (Projet de Fin d'Études) projects, tasks, labs, and student submissions. Built with React + Firebase.

---

## 🗂 Project Structure

```
pfehub/
├── src/
│   ├── firebase.js                  ← Firebase app init + exports
│   ├── main.jsx                     ← React entry point
│   ├── App.jsx                      ← Root layout + routing
│   ├── context/
│   │   └── AuthContext.jsx          ← Firebase Auth context + hooks
│   ├── services/
│   │   ├── firestoreService.js      ← All Firestore CRUD operations
│   │   └── storageService.js        ← Firebase Storage upload/download
│   ├── hooks/
│   │   └── useFirestore.js          ← Custom React hooks for data
│   ├── components/
│   │   ├── UI.jsx                   ← Design system (Badge, Modal, etc.)
│   │   ├── Sidebar.jsx              ← Navigation sidebar
│   │   └── TopBar.jsx               ← Top header + notifications
│   └── pages/
│       ├── AuthPage.jsx             ← Login / Register / Reset
│       ├── AdminDashboard.jsx       ← Teacher overview
│       ├── StudentDashboard.jsx     ← Student overview
│       ├── ProjectsPage.jsx         ← Project CRUD + student assignment
│       ├── TasksPage.jsx            ← Task management + deadlines
│       ├── LabsPage.jsx             ← Practical labs + submissions
│       ├── ResourcesPage.jsx        ← File library + Firebase Storage
│       ├── SubmissionsPage.jsx      ← Submit work + grade + feedback
│       ├── StudentsPage.jsx         ← Student roster (admin)
│       └── AnalyticsPage.jsx        ← Charts and stats
├── firestore.rules                  ← Firestore security rules
├── storage.rules                    ← Storage security rules
├── firestore.indexes.json           ← Composite indexes
├── firebase.json                    ← Firebase Hosting + deploy config
├── vite.config.js
├── package.json
└── index.html
```

---

## 🚀 Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd pfehub
npm install
```

### 2. Firebase is already configured

Your `src/firebase.js` uses project **pfe26-41918**. No `.env` needed unless you want to use environment variables (recommended for production):

```bash
# .env.local
VITE_FIREBASE_API_KEY=AIzaSyBJUIJPsO2xbafv0-LygN7Zo3n9NcwgI6Y
VITE_FIREBASE_AUTH_DOMAIN=pfe26-41918.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=pfe26-41918
VITE_FIREBASE_STORAGE_BUCKET=pfe26-41918.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=790173347722
VITE_FIREBASE_APP_ID=1:790173347722:web:7b53b6897f7266130a2273
VITE_FIREBASE_MEASUREMENT_ID=G-ET85C0TF37
```

Then update `src/firebase.js` to use `import.meta.env.VITE_*`.

### 3. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## 🔥 Firebase Console Setup

### Enable Authentication

1. Go to **Firebase Console → Authentication → Sign-in method**
2. Enable **Email/Password**

### Firestore Database

1. Go to **Firestore Database → Create database**
2. Start in **production mode**
3. Deploy rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Storage

1. Go to **Storage → Get started**
2. Deploy rules:

```bash
firebase deploy --only storage
```

### CORS for Storage (if needed)

Create `cors.json`:
```json
[{
  "origin": ["http://localhost:3000", "https://pfe26-41918.web.app"],
  "method": ["GET", "POST", "PUT", "DELETE"],
  "maxAgeSeconds": 3600
}]
```

Apply: `gsutil cors set cors.json gs://pfe26-41918.firebasestorage.app`

---

## 📊 Firestore Data Schema

```
users/{uid}
  ├── name: string
  ├── email: string
  ├── role: "admin" | "student"
  ├── avatar: string (initials)
  └── createdAt: timestamp

projects/{id}
  ├── title: string
  ├── description: string
  ├── teacherId: string (uid)
  ├── status: "active" | "completed" | "archived"
  ├── students: string[] (array of student UIDs)
  └── createdAt: timestamp

tasks/{id}
  ├── title: string
  ├── description: string
  ├── projectId: string
  ├── teacherId: string
  ├── deadline: string (YYYY-MM-DD)
  ├── status: "pending" | "in_progress" | "completed"
  ├── submissionCount: number
  └── createdAt: timestamp

labs/{id}
  ├── title: string
  ├── description: string
  ├── instructions: string
  ├── category: string
  ├── difficulty: "beginner" | "intermediate" | "advanced"
  ├── duration: string
  ├── teacherId: string
  └── createdAt: timestamp

resources/{id}
  ├── title: string
  ├── category: string
  ├── fileUrl: string (Storage URL)
  ├── fileName: string
  ├── type: string (pdf, zip, etc.)
  ├── size: string
  ├── downloads: number
  ├── uploadedBy: string (uid)
  └── createdAt: timestamp

submissions/{id}
  ├── taskId: string
  ├── studentId: string (uid)
  ├── studentName: string
  ├── type: string (pdf, zip, github)
  ├── fileName: string
  ├── fileUrl: string (Storage URL)
  ├── githubRepo: string
  ├── grade: number | null
  ├── feedback: string
  ├── status: "pending" | "graded" | "late"
  └── submittedAt: timestamp

notifications/{id}
  ├── userId: string (uid)
  ├── message: string
  ├── type: "task" | "grade" | "deadline" | "resource" | "feedback"
  ├── read: boolean
  └── createdAt: timestamp
```

---

## 🚢 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Build
npm run build

# Deploy everything
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting
```

Your app will be live at: `https://pfe26-41918.web.app`

---

## 🔒 User Roles

| Feature            | Admin (Teacher) | Student        |
|--------------------|:--------------:|:--------------:|
| Create projects    | ✅              | ❌             |
| Assign students    | ✅              | ❌             |
| Create tasks       | ✅              | ❌             |
| Create labs        | ✅              | ❌             |
| Upload resources   | ✅              | ❌             |
| Grade submissions  | ✅              | ❌             |
| View analytics     | ✅              | ❌             |
| View assigned work | ✅              | ✅             |
| Submit work        | ❌              | ✅             |
| View own grades    | ❌              | ✅             |

---

## ⚙️ Making a User an Admin

After a user registers, go to **Firestore → users → {uid}** and change `role` from `"student"` to `"admin"`.

Or use Firebase Admin SDK in a Cloud Function.

---

## 🛠 Tech Stack

| Layer         | Technology                         |
|---------------|-----------------------------------|
| Frontend      | React 18 + Vite                   |
| Auth          | Firebase Authentication           |
| Database      | Firebase Firestore                |
| File Storage  | Firebase Storage                  |
| Hosting       | Firebase Hosting                  |
| Styling       | Inline CSS (design system in UI.jsx) |
| Fonts         | Syne + Space Mono + JetBrains Mono |
