
import admin from "firebase-admin";
import env from "./env.js";

const initializeFirebase = () => {
  try {
    if (admin.apps.length > 0) {
      return admin;
    }

    if (
      !env.FIREBASE_PROJECT_ID ||
      !env.FIREBASE_CLIENT_EMAIL ||
      !env.FIREBASE_PRIVATE_KEY
    ) {
      console.warn("Firebase credentials are missing. FCM is disabled.");
      return null;
    }

    const serviceAccount = {
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");

    return admin;
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    throw error;
  }
};

const firebaseAdmin = initializeFirebase();

export default firebaseAdmin;
