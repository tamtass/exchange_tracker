# Firebase Functions

This folder contains Firebase Cloud Functions used by Exchange Tracker.

Setup:

1. cd functions
2. npm install
3. npm run build
4. firebase deploy --only functions

The example functions:
- `scheduledFetchRates` — runs every 60 minutes to fetch latest rates and store them in Firestore.
- `checkAlertsAndNotify` — runs every 15 minutes to evaluate user alerts and send FCM notifications.
