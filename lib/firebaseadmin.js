// lib/firebaseAdmin.js
// /lib/firebaseAdmin.js
// /lib/firebaseAdmin.js
import admin from "firebase-admin";

// ⚠️ Remplace les "\n" par des vrais retours à la ligne pour la clé
const PRIVATE_KEY = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(
  /\\n/g,
  "\n"
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: PRIVATE_KEY,
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

// On exporte TOUJOURS le même singleton
export { admin };
