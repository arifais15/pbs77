import admin from 'firebase-admin';

declare global {
  // allow global across hot reloads
  // eslint-disable-next-line no-var
  var __firebase_admin_initialized: boolean | undefined;
}

function initFirebaseAdmin() {
  if (global.__firebase_admin_initialized) return admin;

  const svcJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;

  if (svcJson) {
    try {
      const cred = typeof svcJson === 'string' ? JSON.parse(svcJson) : svcJson;
      admin.initializeApp({ credential: admin.credential.cert(cred as any) });
      global.__firebase_admin_initialized = true;
      return admin;
    } catch (err) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON, falling back to default credentials', err);
    }
  }

  // Fallback to Application Default Credentials (GCP environment)
  try {
    admin.initializeApp();
    global.__firebase_admin_initialized = true;
  } catch (err) {
    console.warn('Firebase Admin initializeApp failed (maybe already initialized):', err);
  }

  return admin;
}

export default initFirebaseAdmin();
