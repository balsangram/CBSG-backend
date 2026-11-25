import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import env from "./env.js";

const initializeFirebase = () => {
  try {
    if (getApps().length > 0) {
      return getMessaging();
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

    const app = initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin initialized successfully");

    return getMessaging(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error.message);
    return null;
  }
};

const messaging = initializeFirebase();

export { messaging };
export default messaging;
