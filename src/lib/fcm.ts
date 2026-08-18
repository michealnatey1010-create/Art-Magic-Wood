import { initializeApp, cert, getApps, getApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getMessaging, type Message, type MulticastMessage } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";

function getServiceAccount(): ServiceAccount | string {
  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envJson) {
    try {
      return JSON.parse(envJson) as ServiceAccount;
    } catch {
      console.error("FIREBASE_SERVICE_ACCOUNT is not valid JSON");
    }
  }

  const filePath = path.join(process.cwd(), "src", "lib", "service-account-key.json");
  if (fs.existsSync(filePath)) {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw) as ServiceAccount;
  }

  throw new Error("Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT or add src/lib/service-account-key.json");
}

export function getFirebaseAdmin(): App {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(getServiceAccount() as ServiceAccount),
    });
  }
  return getApp();
}

export async function sendNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const app = getFirebaseAdmin();
    const message: Message = {
      token,
      notification: { title, body },
      android: { priority: "high" },
      ...(data ? { data } : {}),
    };
    return await getMessaging(app).send(message);
  } catch (e) {
    console.error("FCM send error:", e);
    return null;
  }
}

export async function sendNotificationToMultipleTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
) {
  const unique = Array.from(new Set(tokens.filter(Boolean)));
  if (unique.length === 0) return;

  try {
    const app = getFirebaseAdmin();
    const message: MulticastMessage = {
      tokens: unique,
      notification: { title, body },
      android: { priority: "high" },
      ...(data ? { data } : {}),
    };
    return await getMessaging(app).sendEachForMulticast(message);
  } catch (e) {
    console.error("FCM multicast send error:", e);
    return null;
  }
}
