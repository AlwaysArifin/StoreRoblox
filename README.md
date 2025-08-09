# ApparelZx with Firebase Firestore integration

This project is the recreated ApparelZx site with Firestore backend for orders.
Before running, you must set up a Firebase project and provide your project's config in `index.html`.

## Steps to create Firebase project & get config
1. Go to https://console.firebase.google.com and sign in.
2. Click **Add project** → follow steps and create project.
3. In the project dashboard, click the gear icon -> **Project settings**.
4. Under **Your apps**, click the **</>** (Web) icon to register a web app. Give it a name and register.
5. Firebase will show you the config object (apiKey, authDomain, projectId, ...). Copy that object and replace the `firebaseConfig` object in `index.html`.
6. In the left menu, open **Firestore Database** → **Create database** → Start in test mode (or locked mode if you prefer) → choose location → Create.
7. Make sure your Firestore rules allow writes (test mode allows it). For production, write secure rules.

## Files changed
- `index.html` — includes Firebase scripts and config placeholder.
- `script-firebase.js` — submits orders to Firestore collection `orders`.

## Troubleshooting
- If orders fail to save, open browser console and check errors. Common issues: wrong projectId, Firestore not enabled, or restrictive security rules.
- After deploying to a hosted domain, ensure Firebase config's authDomain and projectId match.

## Notes
This project uses the **compat** Firebase scripts (convenient for quick upgrades). If you prefer the modular SDK, I can migrate the code.

