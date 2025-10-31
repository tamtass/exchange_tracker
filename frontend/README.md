# Frontend (Exchange Tracker)

Local dev:

1. Copy `.env.example` to `.env.local` and fill Firebase values.
2. cd frontend
3. npm install
4. npm run dev

Build and preview:

- npm run build
- npm run preview

Notes:
- Service worker and PWA are configured via `vite-plugin-pwa`.
- Firebase initialization is in `src/services/firebase.ts`.
