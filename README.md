# ClassPulse‑Parent

Combined repository for the **ClassPulse** teacher app and the **ParentPulse** parent app. Both are built with Expo (React Native + TypeScript) and share a Supabase backend for authentication and data storage.

> Two companion mobile applications aimed at simplifying classroom management. Teachers use **ClassPulse** to record attendance, homework, test results, notices and fees. Parents use **ParentPulse** to view their child’s attendance, homework, performance, notices and make payments.

---

## 🧩 Projects in this repository

- `ClassPulse/` – the **Teacher** application. Teachers can log in, create batches, add students, mark attendance, post notices, assign homework, record test results and fees.
- `ParentPulse/` – the **Parent** application. Parents authenticate with their email, select a student, and view all relevant information sent by the teacher.

Both apps use the same database tables in a single Supabase project. Teacher actions write rows; parent app reads them in real time using Supabase subscriptions.

---

## 🚀 Getting started

> These instructions assume you have **Node.js** installed and are working on a machine with Expo CLI (`npm install -g expo-cli`) or using `npx`.

```bash
# clone the repo (if you haven't already)
git clone https://github.com/its-vanshita/ClassPulse-Parent.git
cd ClassPulse-Parent
```

Each app is an independent Expo project, so repeat the following in its directory.

```bash
# install dependencies
npm install

# start the development server
npx expo start
```

Use the QR code to open the app in **Expo Go**, or launch an emulator/simulator (Android Studio, Xcode). Both apps support web via Expo as well.

### Resetting to starter code

Inside either app you’ll find `scripts/reset-project.js`. Running

```bash
npm run reset-project
```

moves the current `app/` folder to `app-example/` and provides a blank scaffold for new features.

---

## 🔧 Configuration

- All shared backend logic is in `src/config/supabase.ts`; replace the URL and anon key with your own project’s values (dashboard → Settings → API).
- `ClassPulse` uses a file named `firestoreService.ts` which actually implements Supabase CRUD operations and real‑time listeners.
- Type definitions live under `src/types/index.ts` in both apps.

> The apps currently point at `https://uhmssrajcefslpkygrxy.supabase.co`;
> update this before deploying or sharing your own copy.

---

## 📂 Directory structure (common patterns)

Both applications follow the same high‑level layout:

```text
app/             # Expo Router pages and layout (file‑based routing)
src/
  components/    # shared UI components (cards, rows, modals)
  config/        # supabase client, theme, constants
  context/       # React context providers for auth & state
  services/      # backend APIs (CRUD, subscriptions)
  hooks/         # custom hooks for data fetching
  screens/       # screen components used by router
  theme/         # color & spacing tokens
  types/         # shared TypeScript types
```

`ParentPulse` also has helper `scripts/` and additional `components/ui` subfolder.

---

## 📱 Key features

### ClassPulse (Teacher)

- Sign up / sign in using phone or email
- Create batches of students with grades/subjects
- Add students and track roll numbers
- Mark attendance with date and status
- Assign homework and track due dates
- Record test results with marks and subjects
- Post notices targeted to one or more batches
- Create and manage fee records and payments
- Live updates via Supabase realtime channels

### ParentPulse (Parent)

- Authenticate using parent email
- Select associated student
- View attendance history
- Read posted homework and notices
- Check test performance and marks
- Track fee invoices and record payments

Both apps are designed for offline‑first mobile experiences and automatically persist sessions using AsyncStorage / localStorage.

---

## 🛠 Development notes

- TypeScript is enabled across the codebase; be sure to keep interfaces in sync when modifying tables.
- Navigation is handled via Expo Router; page files under `app/` map to routes automatically.
- Real‑time subscriptions use `supabase.channel` with `postgres_changes` events.
- The teacher app still refers to backend files as `firestoreService` for legacy reasons, but nothing uses Firebase.

---

## 🌐 Deployment

This repository does not include production build/deployment scripts. To publish, build the apps using Expo’s build service (`eas build`) or export to native projects and follow platform guides. Ensure the Supabase project is configured with proper policies and an `anon` key for public reads.

---

## 🙏 Contributing

Feel free to open issues or pull requests! Keep changes scoped to one of the two apps and update types/tests as needed. Before pushing, run linting or formatting if configured.

---

## 📄 License

_(Add your license information here, e.g. MIT)_
